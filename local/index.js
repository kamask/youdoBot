function log(m){console.log(m)}
const WD =  require('./KskWebDriver')

;(async ()=>{

    const wdTW = await new WD().building('chrome') // tw - Tasks Watcher
    const wdTFI = await new WD().building('chrome') // tfi - Task Full Info
    const wdTA = await new WD().building('chrome') // tfi - Task Answer

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


    wdTW.d.sleep(60000)
    wdTFI.d.sleep(60000)
    wdTA.d.sleep(60000)

})()