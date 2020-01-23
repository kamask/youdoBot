function log(m){console.log(m)}
const WD =  require('./KskWebDriver')
const io = require('socket.io-client')
const socket = io.connect('http://youdobot.sha88.ru')
socket.on('connect', ()=>{
    socket.emit('kskConnect', 'Local App')
})
socket.on('kskTBot', data => {
    log(data)
})

;(async ()=>{

    /*--------------------- INIT and AUTH   --------------------------------------------*/

    const wdTW = await new WD().building('chrome') // tw - Tasks Watcher
    wdTW.d.manage().window().minimize()
    const wdTFI = await new WD().building('chrome') // tfi - Task Full Info
    wdTFI.d.manage().window().minimize()
    wdTFI.state.busy = false
    wdTFI.state.tasksStack = []
    const wdTA = await new WD().building('chrome') // tfi - Task Answer
    wdTA.d.manage().window().minimize()


    await wdTW.open('https://youdo.com/tasks-all-opened-all-1')
    await wdTFI.open('https://youdo.com')
    await wdTA.open('https://youdo.com')

    let loginInput, passwordInput, auth, waitSec = 1500
    let loginButton = await wdTW.findSelector('a.link___d4089:nth-child(1)', 1000, true)
    do{
        await loginButton.click()
        loginButton = null
        loginInput = await wdTW.findSelector('div.row:nth-child(1) > input:nth-child(1)')
        passwordInput = await wdTW.findSelector('div.row:nth-child(2) > input:nth-child(1)')
        await loginInput.sendKeys(process.env.YOUDO_LOGIN)
        await passwordInput.sendKeys(process.env.YOUDO_PASS, WD.key.RETURN)
        await wdTW.reload(waitSec)

        while(!(await wdTW.findSelector('.block___d4bb2', 500))){
            loginButton = await wdTW.findSelector('a.link___d4089:nth-child(1)', 500)
            if(!loginButton) await wdTW.reload()
            else{
                log('WebDriver: Task Watcher - NO auth!!! Try retry ...')
                break
            }
        }
        auth = !loginButton
    }while(!auth)

    log('WebDriver: Task Watcher - auth!')

    const cookies = await wdTW.d.manage().getCookies()
    for(let i of cookies){
        await wdTFI.d.manage().addCookie(i)
        await wdTA.d.manage().addCookie(i)
    }
    await wdTFI.findSelector('.block___d4bb2', 500, true)
    log('WebDriver: Task Full Info - auth!')
    await wdTA.findSelector('.block___d4bb2', 500, true)
    log('WebDriver: Task Answer - auth!')






    /*--------------------- Get Tasks and send to server   --------------------------------------------*/

    let currentLtId = null
    while(true){
        try{

            let ltLink = await wdTW.findSelector('li.listItem___a431d:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)')
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
                ltLink = await wdTW.findSelector('li.listItem___a431d:nth-child(' + i++ + ') > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)')
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
            await wdTFI.open('https://youdo.com/t' + id)
            const infoWrapper = await wdTFI.findSelector('.b-task-item-base-info', 5000, true)
            const userInfo = await wdTFI.findSelector('.b-task-block__userinfo__name', 5000, true)
            socket.emit('kskTaskFullInfo', {
                id,
                title: await (await infoWrapper.findElement(WD.by.css('.b-task-block__header__title'))).getText(),
                text: await (await infoWrapper.findElement(WD.by.css('.b-task-block__description'))).getText(),
                address: await (await infoWrapper.findElement(WD.by.css('.b-task-block__address > .b-task-block__info'))).getText(),
                date: await (await infoWrapper.findElement(WD.by.css('.b-task-block__date__wrap'))).getText(),
                price: await (await infoWrapper.findElement(WD.by.css('.b-task-block__budget > .b-task-block__info'))).getText(),
                priceMethod: await (await infoWrapper.findElement(WD.by.css('.b-task-block__payment > .b-task-block__info'))).getText(),
                place: await (await infoWrapper.findElement(WD.by.css('.b-task-block__location > .b-task-block__info'))).getText(),
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



    wdTFI.d.sleep(60000)
    wdTA.d.sleep(60000)

})()
