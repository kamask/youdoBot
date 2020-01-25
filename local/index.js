function log(m){console.log(m)}
const WD =  require('./KskWebDriver')
const io = require('socket.io-client')
const socket = io.connect(process.env.TELEGRAM_BOT_SERVER)
socket.on('connect', ()=>{
    socket.emit('kskConnect', 'Local App')
})
socket.on('kskTBot', data => {
    log(data)
})
socket.on('kskLog', data => {
    log(data)
})
let wdGT, wdTA

;(async ()=>{

    /*--------------------- INIT and AUTH   --------------------------------------------*/

    wdGT = await new WD().building('chrome') // GT - Get Task
    wdGT.d.manage().window().minimize()
    wdGT.d.get('https://youdo.com')

    wdTA = await new WD().building('chrome') // TA - Task Answer
    wdTA.d.manage().window().minimize()
    wdTA.d.get('https://youdo.com')

    let auth, authCount = 0, authTrying = 0

    do{
        log('Auth trying - ' + (++authTrying))
        await wdGT.d.get('https://youdo.com')
        let res = await wdGT.d.executeScript(async () => {
            return await fetch('/api/users/signin/', {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                method: 'POST',
                body: 'login='+arguments[0]+'&password='+arguments[1]
            })
        }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
        await wdGT.reload()
        auth = await wdGT.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)
    }while(!auth)

    log('WebDriver: Task Watcher - auth!')
    authCount++

    const cookies = await wdGT.d.manage().getCookies()
    for(let i of cookies) await wdTA.d.manage().addCookie(i)

    await wdTA.reload(500)

    if(await wdTA.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)){
        log('WebDriver: Task Answer - auth!')
        authCount++
    }


    /*--------------------- Get Tasks and send to server   --------------------------------------------*/

    let currentLtId = 0
    while(authCount === 2){
        try{

            await wdGT.d.get('https://youdo.com/api/tasks/tasks/?q=&list=all&status=opened&lat=55.753215&lng=37.622504&radius=30&page=1&noOffers=false&onlySbr=false&onlyB2B=false&priceMin=&sortType=1&onlyVirtual=false&sub=30&sub=34&sub=32&sub=110&sub=84&sub=109&sub=90')
            const tasks = JSON.parse(await (await wdGT.d.findElement({css: 'pre'})).getText()).ResultObject.Items

            let i = 0
            while(currentLtId < tasks[i].Id){
                if(currentLtId === 0) currentLtId = tasks[i].Id
                log('\nNew task - ' + tasks[i].Id + ' | ' + new Date().toLocaleString('ru-RU'))
                    const task = {
                    id: tasks[i].Id,
                    title: tasks[i].Name,
                    price: tasks[i].PriceAmount,
                    budget: tasks[i].BudgetDescription,
                    secure: tasks[i].IsSbr,
                    address: tasks[i].Address,
                    userName: tasks[i].CreatorInfo.UserName,
                    userAvatar: tasks[i].CreatorInfo.Avatar.slice(0,-6)+'H180W180',
                    userId: tasks[i].CreatorInfo.Id,
                    userRate: [tasks[i].CreatorInfo.Rating.PositiveReviews, tasks[i].CreatorInfo.Rating.NegativeReviews],
                    photo: []
                }
                await wdGT.d.get('https://youdo.com/api/tasks/taskmodel/?taskId='+task.id)
                let taskFull = JSON.parse(await (await wdGT.d.findElement({css: 'pre'})).getText()).ResultObject
                task.place = taskFull.AttributesValues.Location.Concatenated
                taskFull = taskFull.TaskData
                task.text = taskFull.Description
                task.date = {created: taskFull.Dates.CreationDate}
                task.date.begin = taskFull.Dates.NeedBeginDate
                task.date.end = taskFull.Dates.NeedEndDate
                if(taskFull.Media.length > 0){
                    taskFull.Media.forEach(j=>{
                        task.photo.push('https://content3.youdo.com/get.content?ContentId='+j.Id+'&size=Max1600')
                    })
                }
                socket.emit('kskNewTask', task)
                i++
            }

            currentLtId = tasks[0].Id
            await wdGT.reload(500)

        }catch(e){
            console.error(e)
            break
        }
    }

})()

socket.on('kskAnswer', async data => {
    log('Answer sending... - ' + data.id)
    await wdTA.d.get('https://youdo.com/t' + data.id)
    await (await wdTA.find({css: 'a.b-task-reactions__button'})).click()
    const form = await wdTA.find({css: '.js-form'})
    await (await form.find({css: '.js-description'})).sendKeys(data.text)
    await (await form.find({css: 'label[for=\'Field__Insurance\']'})).click()
    await (await form.find({css: '.b-dialog--add_offer__price__value'})).sendKeys(data.price, WD.key.RETURN)
    await wdTA.reload(2000)
    const place = await (await wdTA.find({css: '.b-task-block__offers__description__text'})).getText()
    const visit = await (await wdTA.d.findElement({css: 'li.item___72b99:nth-child(2)'})).getText()
    log('Answer send! - ' + data.id)
    socket.emit('kskAnswerData', (place + '\n' + visit))
})
