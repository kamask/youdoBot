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
let wdTA

;(async ()=>{

    /*--------------------- INIT and AUTH   --------------------------------------------*/

    const wdTW = await new WD().building('chrome') // tw - Tasks Watcher
    wdTW.d.manage().window().minimize()

    const wdTFI = await new WD().building('chrome') // tfi - Task Full Info
    wdTFI.d.manage().window().minimize()
    wdTFI.d.get('https://youdo.com')
    wdTFI.state.busy = false
    wdTFI.state.tasksStack = []

    wdTA = await new WD().building('chrome') // tfi - Task Answer
    wdTA.d.manage().window().minimize()
    wdTA.d.get('https://youdo.com')

    let auth, authCount = 0, authTrying = 0

    do{
        log('Auth trying - ' + (++authTrying))
        await wdTW.d.get('https://youdo.com/tasks-all-opened-all-1')
        await wdTW.d.executeScript(() => {
            return fetch('/api/users/signin/', {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                method: 'POST',
                body: 'login='+arguments[0]+'&password='+arguments[1]
            })
        }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
        auth = await wdTW.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)
    }while(!auth)

    log('WebDriver: Task Watcher - auth!')
    authCount++

    const cookies = await wdTW.d.manage().getCookies()
    for(let i of cookies){
        await wdTFI.d.manage().addCookie(i)
        await wdTA.d.manage().addCookie(i)
    }

    await wdTFI.reload(500)
    wdTA.reload()

    if(await wdTFI.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)){
        log('WebDriver: Task Full Info - auth!')
        authCount++
    }

    if(await wdTA.d.executeScript(()=>window.YouDo.GuardCheck.isAuth)){
        log('WebDriver: Task Answer - auth!')
        authCount++
    }





    /*--------------------- Get Tasks and send to server   --------------------------------------------*/

    let currentLtId = null
    while(authCount === 3){
        try{

            let ltLink = await wdTW.find({css: 'li.listItem___a431d:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)'})
            let ltId = await ltLink.getAttribute('data-id')
            let ltText = await ltLink.getText()

            if(!currentLtId){
                currentLtId = ltId
                log('\n---\nNew task - ' + ltId + ' | ' + new Date().toLocaleString('ru-RU'))
                socket.emit('kskNewTask', {id: ltId, title: ltText})
                sendToTelegramBot(ltId)
            }

            let i = 3, newTasksId = []
            while(currentLtId < ltId){
                log('\n---\nNew task - ' + ltId + ' | ' + new Date().toLocaleString('ru-RU'))
                socket.emit('kskNewTask', {id: ltId, title: ltText})
                newTasksId.push(ltId)
                ltLink = await wdTW.find({css: 'li.listItem___a431d:nth-child(' + i++ + ') > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)'})
                ltId = await ltLink.getAttribute('data-id')
                ltText = await ltLink.getText()
            }

            if(newTasksId.length > 0){
                currentLtId = newTasksId[0]
                do{
                    let tempId = newTasksId.shift()
                    sendToTelegramBot(tempId)
                }while(newTasksId.length > 0)
            }

            await wdTW.reload(500)

        }catch(e){
            console.error(e)
            break
        }
    }

    async function sendToTelegramBot(id){
        if(!wdTFI.state.busy){

            wdTFI.state.busy = true
            log('Task info getting - ' + id + ' ...')
            await wdTFI.d.get('https://youdo.com/t' + id)
            const infoWrapper = await wdTFI.find({css: '.b-task-item-base-info'}, 5000)
            const userInfo = await wdTFI.find({css: '.b-task-block__userinfo__name'}, 5000)
            socket.emit('kskTaskFullInfo', {
                id,
                title: await (await infoWrapper.findElement({css: '.b-task-block__header__title'})).getText(),
                text: await (await infoWrapper.findElement({css: '.b-task-block__description'})).getText(),
                address: await (await infoWrapper.findElement({css: '.b-task-block__address > .b-task-block__info'})).getText(),
                date: await (await infoWrapper.findElement({css: '.b-task-block__date__wrap'})).getText(),
                price: await (await infoWrapper.findElement({css: '.b-task-block__budget > .b-task-block__info'})).getText(),
                priceMethod: await (await infoWrapper.findElement({css: '.b-task-block__payment > .b-task-block__info'})).getText(),
                place: await (await infoWrapper.findElement({css: '.b-task-block__location > .b-task-block__info'})).getText(),
                name: await userInfo.getText(),
                authorLink: await  userInfo.getAttribute('href')
            })
            log('Task info getting done! - ' + id + '\n---')
            wdTFI.state.busy = false
            if(wdTFI.state.tasksStack.length > 0) sendToTelegramBot(wdTFI.state.tasksStack.shift())

        }else{
            wdTFI.state.tasksStack.push(id)
        }
    }


})()

socket.on('kskAnswer', async data => {
    log('Answer sending... - ' + data.id)
    await wdTA.d.get('https://youdo.com/t' + data.id)
    await (await wdTA.find({css: '.b-task-reactions__button'})).click()
    await wdTA.find({css: '.b-dialog--add_offer__tpl__item'})
    await (await wdTA.find({css: '.js-description'})).sendKeys(data.text)
    await (await wdTA.find({css: 'label[for=\'Field__Insurance\']'})).click()
    await (await wdTA.find({css: '.b-dialog--add_offer__price__value'})).sendKeys(data.price, WD.key.RETURN)
    await wdTA.reload(2000)
    const place = await (await wdTA.find({css: '.b-task-block__offers__description__text'})).getText()
    const visit = await (await wdTA.d.findElement({css: 'li.item___72b99:nth-child(2)'})).getText()
    log('Answer send! - ' + data.id)
    socket.emit('kskAnswerData', (place + '\n' + visit))
})
