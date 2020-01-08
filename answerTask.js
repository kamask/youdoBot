const data = require('./data')
const config = require('./config')
const {Builder, By, Key, until} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

let driver
taskWaiting()

async function taskWaiting() {
    driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
    /*-----------------------   Login   ----------------------*/
    await driver.get('https://youdo.com/verification')
    await driver.wait(until.elementLocated(By.className('b-vpromo-hero__button'))).click()
    await driver.wait(until.elementLocated(By.className('dialog-signin')))
    await driver.wait(until.elementLocated(By.linkText('Войдите'))).click()
    await driver.wait(until.elementLocated(By.name('login'))).sendKeys(config.youdo.login)
    await driver.wait(until.elementLocated(By.name('password'))).sendKeys(config.youdo.password, Key.RETURN)
    console.log('Driver Answer Task - Auth')
}

module.exports = async function(task){
    await driver.get('https://youdo.com/t'+task.id)
    await driver.wait(until.elementLocated(By.className('js-addOffer'))).click()
    await driver.wait(until.elementLocated(By.name('Description'))).sendKeys(`
Здравствуйте${task.nameAnswer}, готов ${task.templateName === '10' ? 'приступить' : 'приехать'} ${task.time[0] === '1' ? 'в течение часа или ' : task.time[0] === '2' ? ' в течение 30 мин. ' : ''}в удобное для Вас время и дату${task.time[1] === '1' ? ', на данный момент свободен' : ''}. 
Согласен на ${task.priceAnswer}руб.
${data.answer.templateText[Number(task.templateName)]}
Мой сайт-визитка с более подробной информацией - mskmaster.tilda.ws
Всю работу провожу быстро и качественно! Работаю на репутацию!
Обращайтесь!
    `)
    await driver.wait(until.elementLocated(By.name('Price'))).sendKeys(task.priceAnswer, Key.RETURN)
    return 777
}