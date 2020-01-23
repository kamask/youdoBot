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
                socket.emit('kskNewTask', {id: ltId, title: ltText})
                // ;(await Task.build(ltId)).sendToTelegramBot()
            }

            let i = 3, newTasksId = []
            while(currentLtId < ltId){
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
                    //;(await Task.build(tempId)).sendToTelegramBot()
                }while(newTasksId.length > 0)
            }

            await wdTW.reload(500)

        }catch(e){
            console.error(e)
            break
        }

    }



    wdTFI.d.sleep(60000)
    wdTA.d.sleep(60000)

})()
