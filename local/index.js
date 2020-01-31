function log(m){console.log(m)}
const WD =  require('./KskWebDriver')
const io = require('socket.io-client')
const socket = io.connect(process.env.TELEGRAM_BOT_SERVER)
let currentLtId = 0

socket.on('connect', ()=>{
    socket.emit('kskConnect', 'Local App')
})
socket.on('kskTBot', data => {
    log(data)
})
socket.on('kskLog', data => {
    log(data)
})
socket.on('kskLast', ()=>{
    currentLtId = 0
})
let wdGT, wdTA

;(async ()=>{

    /*--------------------- INIT and AUTH   --------------------------------------------*/

    async function build() {
        wdGT = await new WD().building('chrome') // GT - Get Task
        //wdGT.d.manage().window().minimize()
        wdGT.d.get('https://youdo.com')

        wdTA = await new WD().building('chrome') // TA - Task Answer
        //wdTA.d.manage().window().minimize()
        wdTA.d.get('https://youdo.com')
    }

    await build()

    let auth, authCount = 0, authTrying = 0

    async function authorizing() {
        do{
            log('Auth trying - ' + (++authTrying))
            await wdGT.d.get('https://youdo.com')
            await wdGT.d.executeScript(async () => {
                return await fetch('/api/users/signin/', {
                    headers: {
                        "accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    method: 'POST',
                    body: 'login='+arguments[0]+'&password='+arguments[1]
                })
            }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
            await wdGT.reload(3000)
            try{
                auth = await wdGT.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)
            }catch(e){
                continue
            }
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
    }

    await authorizing()


    /*--------------------- Get Tasks and send to server   --------------------------------------------*/


    ;(async function mainloop(){
        while(authCount === 2){
            try{

                await wdGT.d.get('https://youdo.com/api/tasks/tasks/?q=&list=all&status=opened&lat=55.753215&lng=37.622504&radius=30&page=1&noOffers=false&onlySbr=false&onlyB2B=false&priceMin=&sortType=1&onlyVirtual=false&sub=30&sub=34&sub=32&sub=110&sub=84&sub=109&sub=90')
                const tasks = await wdGT.d.executeScript(()=>{
                    return JSON.parse(document.querySelector('pre').innerText).ResultObject.Items
                })

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

                    let taskFull = await wdGT.d.executeScript(()=>{
                        return JSON.parse(document.querySelector('pre').innerText).ResultObject
                    })

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
                await wdGT.d.sleep(1000)

            }catch(e){
                console.error(e)
                break
            }
        }

        auth = false
        authCount = 0
        authTrying = 0

        await build()
        await authorizing()
        await mainloop()
    })()

})()



socket.on('kskAnswer', async data => {
    let done = false
    while(!done){
        log('Answer sending... - ' + data.id)
        await wdTA.d.get('https://youdo.com/t' + data.id)
        await wdTA.find({css: '.b-task-reactions__button'})
        await wdTA.d.executeScript("document.querySelector('.b-task-reactions__button').click()")
        await wdTA.find({css: '.dialog__content > form'})
        await wdTA.d.executeScript(()=>{
            document.querySelector('.b-dialog--add_offer__description > textarea').value = arguments[0]
            document.querySelector('.b-dialog--add_offer__price__value').value = arguments[1]
            document.querySelector('#Field__Insurance').checked = false
            document.querySelector('.b-dialog--add_offer__submit').click()
        }, data.text, data.price)
        await wdTA.reload(2000)
        const place = await (await wdTA.find({css: '.b-task-block__offers__description__text'})).getText()
        const visit = await (await wdTA.d.findElement({css: 'li.item___72b99:nth-child(2)'})).getText()
        log('Answer send! - ' + data.id)
        done = true
        socket.emit('kskAnswerData', (place + '\n' + visit))
    }

})
