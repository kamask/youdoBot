const config = require('./config')
const {Builder, By, Key, until} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
let driver, tasks = []
const telebot = require('./telebot')

taskWaiting()
async function taskWaiting(){
    driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
    /*-----------------------   Login   ----------------------*/
    await driver.get('https://youdo.com/verification')
    await driver.wait(until.elementLocated(By.className('b-vpromo-hero__button'))).click()
    await driver.wait(until.elementLocated(By.className('dialog-signin')))
    await driver.wait(until.elementLocated(By.linkText('Войдите'))).click()
    await driver.wait(until.elementLocated(By.name('login'))).sendKeys(config.youdo.login)
    await driver.wait(until.elementLocated(By.name('password'))).sendKeys(config.youdo.password, Key.RETURN)
    console.log('Get Task Auth')
    while(true){
        try{
            if(tasks.length > 0){
                console.log('TaskSend!')
                telebot.send(tasks.shift())
            }
        }catch(e){break}
        await driver.sleep(100)
    }

}

module.exports = async function(id){
    console.log('TaskGet!')
    await driver.get('https://youdo.com/t'+id)
    await driver.wait(until.elementLocated(By.className('b-task-block__header__title')))
    await driver.sleep(500)
    tasks.push({
        id,
        title: await driver.findElement(By.className('b-task-block__header__title')).getText(),
        text: await driver.findElement(By.css('.b-task-block__main .js-value')).getText(),
        address: await driver.findElement(By.css('.b-task-block__address .js-value')).getText(),
        date: await driver.findElement(By.className('b-task-block__date')).getText(),
        price: await driver.findElement(By.className('js-budget-text')).getText(),
        priceType: await driver.findElement(By.className('js-pay-type-block')).getText(),
        name: await driver.findElement(By.className('b-task-block__userinfo__name')).getText(),
        nameLink: await driver.findElement(By.className('b-task-block__userinfo__name')).getAttribute('href')
    })
}