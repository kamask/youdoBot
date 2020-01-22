const WD =  require('./WebDriver')

;(async ()=>{

    const wd = await new WD().building('chrome')
    await wd.open('https://youdo.com/tasks-all-opened-all-1')

    let loginButton, loginInput, passwordInput, uid, nuid

    loginButton = await wd.findSelector('a.link___d4089:nth-child(1)', 1000, true)
    await loginButton.click()
    loginInput = await wd.findSelector('div.row:nth-child(1) > input:nth-child(1)')
    passwordInput = await wd.findSelector('div.row:nth-child(2) > input:nth-child(1)')
    await loginInput.sendKeys('s@sha88.ru')
    await passwordInput.sendKeys('Avoe8AUE', WD.key.RETURN)
    await wd.reload(2000)
    uid = await wd.findSelector('.block___d4bb2', 500)

    const cook = await wd.d.manage().getCookies()

    const nwd = await new WD().building('chrome')
    cook.forEach(async i=> {
        await nwd.d.manage().addCookie(i)
    })
    await nwd.open('https://youdo.com/t6923585')
    nuid = await nwd.findSelector('.block___d4bb2', 500, true)


    nwd.d.sleep(60000)
    wd.d.sleep(60000)

})()