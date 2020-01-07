const config = require('./config')
const {Builder, By, Key, until} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const getTaskInfo = require('./getTaskInfo')

webrun()


async function webrun(){
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
    try {


/*-----------------------   Login   ----------------------*/
        await driver.get('https://youdo.com/verification')
        await driver.wait(until.elementLocated(By.className('b-vpromo-hero__button'))).click()
        await driver.wait(until.elementLocated(By.className('dialog-signin')))
        await driver.wait(until.elementLocated(By.linkText('Войдите'))).click()
        await driver.wait(until.elementLocated(By.name('login'))).sendKeys(config.youdo.login)
        await driver.wait(until.elementLocated(By.name('password'))).sendKeys(config.youdo.password, Key.RETURN)

/*-----------------------   Get Tasks   ----------------------*/
        await driver.sleep(500)
        await driver.get('https://youdo.com/tasks-all-opened-all-1')
        console.log('Main Window Auth')

        let currentLastTask, lastTask

        while(true){
            try{
                currentLastTask = Number(await driver.wait(until.elementLocated(By.className('js-task-title')), 1000).getAttribute('data-id'))
                break
            }catch(e){}
            console.log('ErrorGetFirstTask')
            await driver.navigate().refresh()
        }


        getTaskInfo(currentLastTask)

        while(true){
            try{
                await driver.sleep(100)
                await driver.navigate().refresh()
                lastTask = Number(await driver.wait(until.elementLocated(By.className('title___7da37'))).getAttribute('data-id'))
                if(currentLastTask === lastTask) continue
                else{
                    let oldLastTask = currentLastTask
                    let task = lastTask
                    currentLastTask = lastTask
                    let i = 3
                    while (oldLastTask < task ){
                        getTaskInfo(task)
                        task = Number(await driver.findElement(By.css('.listItem___a431d:nth-child('+ i++ +') .title___7da37')).getAttribute('data-id'))
                    }
                }
            }catch(e){break}
        }


    }finally{await driver.quit()}
}