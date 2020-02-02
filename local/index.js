function log(m){console.log(m)}
const WD =  require('./KskWebDriver')
const io = require('socket.io-client')
const socket = io.connect(process.env.TELEGRAM_BOT_SERVER)
let currentLtId = 0, getWithId = null

socket.on('connect', ()=>{
    socket.emit('kskConnect', 'Local App')
})
socket.on('kskTBot', data => {
    log(data)
})
socket.on('kskLog', data => {
    log(data)
})
socket.on('kskLast', () => {
    currentLtId = 0
})
socket.on('kskGetWithId', id => {
    getWithId = id
})
let wdGT, wdTA

async function main(){

    /*--------------------- INIT and AUTH   --------------------------------------------*/

    wdGT = await new WD().building('chrome') // GT - Get Task
    //wdGT.d.manage().window().minimize()
    wdGT.d.get('https://youdo.com')

    wdTA = await new WD().building('chrome') // TA - Task Answer
    //wdTA.d.manage().window().minimize()
    wdTA.d.get('https://youdo.com')

    let auth, authCount = 0, authTrying = 0
    do{
        log('Auth trying - ' + (++authTrying))
        await wdGT.d.get('https://youdo.com')
        await wdGT.d.executeAsyncScript(() => {
            fetch('/api/users/signin/', {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                method: 'POST',
                body: 'login='+arguments[0]+'&password='+arguments[1]
            }).then((res)=>{
                arguments[2](res)
            }).catch(e=>{
                arguments[2](e)
            })
        }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
        await wdGT.reload()
        try{ auth = await wdGT.d.executeScript(()=>window.YouDo.GuardCheck.isAuth) }catch(e){}
    }while(!auth)

    log('WebDriver: Task Watcher - auth!')
    authCount++

    const cookies = await wdGT.d.manage().getCookies()
    for(let i of cookies) await wdTA.d.manage().addCookie(i)

    auth = false
    do{
        await wdTA.d.get('https://youdo.com')
        try{ auth = await wdTA.d.executeScript(()=>window.YouDo.GuardCheck.isAuth) }catch(e){}
    }while (!auth)

    log('WebDriver: Task Answer - auth!')
    authCount++



    /*--------------------- Get Tasks and send to server   --------------------------------------------*/

    while(authCount === 2){

        if(getWithId){
            let task = {id: getWithId}
            getWithId = null

            let taskFull
            try{
                await wdGT.d.get('https://youdo.com/api/tasks/taskmodel/?taskId='+task.id)
                taskFull = await wdGT.d.executeScript(()=>{
                    return JSON.parse(document.querySelector('pre').innerText).ResultObject
                })
            }catch (e) {
                return 1
            }

            try{ task.place = taskFull.AttributesValues.Location.Concatenated }catch(e){ task.place = '' }
            taskFull = taskFull.TaskData
            task.title = taskFull.Title
            task.price = taskFull.Price.Amount || null
            task.budget = !taskFull.Price.Amount ? taskFull.Price.PriceInHeader.StringFormat : null
            task.secure = taskFull.IsSbr
            task.address = taskFull.Addresses.length > 0 ? taskFull.Addresses[0].Address : null
            task.userName = taskFull.CreatorInfo.UserInfo.UserName
            task.userAvatar = "https://avatar.youdo.com/get.userAvatar?AvatarId="+taskFull.CreatorInfo.UserInfo.Avatar.Id+"&AvatarType=H180W180"
            task.userId = taskFull.CreatorInfo.UserInfo.Id
            task.userRate = [taskFull.CreatorInfo.Scores.PositiveReviews, taskFull.CreatorInfo.Scores.NegativeReviews]
            task.text = taskFull.Description
            task.date = {created: taskFull.Dates.CreationDate}
            task.date.begin = taskFull.Dates.NeedBeginDate
            task.date.end = taskFull.Dates.NeedEndDate
            task.photo = []
            if(taskFull.Media.length > 0){
                try{
                    taskFull.Media.forEach(j=>{
                        task.photo.push('https://content3.youdo.com/get.content?ContentId='+j.Id+'&size=Max1600')
                    })
                }catch (e) {
                    return 1
                }
            }

            socket.emit('kskNewTask', task)
        }

        let tasks
        try{
            await wdGT.d.get('https://youdo.com/api/tasks/tasks/?q=&list=all&status=opened&lat=55.753215&lng=37.622504&radius=30&page=1&noOffers=false&onlySbr=false&onlyB2B=false&priceMin=&sortType=1&onlyVirtual=false&sub=30&sub=34&sub=32&sub=110&sub=84&sub=109&sub=90')
            tasks = await wdGT.d.executeScript(()=>{
                return JSON.parse(document.querySelector('pre').innerText).ResultObject.Items
            })
        }catch (e) {
            return 1
        }

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

            let taskFull
            try{
                await wdGT.d.get('https://youdo.com/api/tasks/taskmodel/?taskId='+task.id)
                taskFull = await wdGT.d.executeScript(()=>{
                    return JSON.parse(document.querySelector('pre').innerText).ResultObject
                })
            }catch (e) {
                return 1
            }

            task.place = taskFull.AttributesValues.Location.Concatenated
            taskFull = taskFull.TaskData
            task.text = taskFull.Description
            task.date = {created: taskFull.Dates.CreationDate}
            task.date.begin = taskFull.Dates.NeedBeginDate
            task.date.end = taskFull.Dates.NeedEndDate
            if(taskFull.Media.length > 0){
                try{
                    taskFull.Media.forEach(j=>{
                        task.photo.push('https://content3.youdo.com/get.content?ContentId='+j.Id+'&size=Max1600')
                    })
                }catch (e) {
                    return 1
                }
            }
            socket.emit('kskNewTask', task)
            i++
        }

        currentLtId = tasks[0].Id


        try{
            await wdGT.d.sleep(1000)
        }catch (e) {
            return 1
        }

    }

    return 0

}

let appstop
do{ try{ appstop = main() }catch(e){} }while(!appstop)



socket.on('kskAnswer', async data => {
    let done = false
    while(!done){
        log('Answer sending... - ' + data.id)
        let place, visit

        await wdTA.d.get('https://youdo.com/t' + data.id)
        await wdTA.find({css: '.b-task-reactions__button'})
        await wdTA.d.executeScript("document.querySelector('.b-task-reactions__button').click()")
        await wdTA.find({css: '.dialog__content > form'})

        await (await wdTA.d.findElement({css: '.b-dialog--add_offer__description > textarea'})).sendKeys(data.text)
        await (await wdTA.d.findElement({css: '.label[for="Field__Insurance"]'})).click()
        await (await wdTA.d.findElement({css: '.b-dialog--add_offer__price__value'})).sendKeys(data.price, WD.key.RETURN)

        await wdTA.reload(3000)

        place = await (await wdTA.find({css: '.b-task-block__offers__description__text'})).getText()
        visit = await (await wdTA.d.findElement({css: 'li.item___72b99:nth-child(2)'})).getText()

        log('Answer send! - ' + data.id)
        done = true
        socket.emit('kskAnswerData', (place + '\n' + visit))
    }
})
