function log(...p){console.log(...p)}
const answerText = require('./textAnswer')
const KskWD = require('./KskWebDriver')

class self {

    static #wd = null
    static #process = false

    static async init() {
        self.#process = true
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth('Answer Task')
        self.#process = false
        return self
    }

    static async build(task) {
        if (!self.#wd && !self.#process) await self.init()
        if (self.#process) await new Promise(resolve => {
            setInterval(() => {
                if (!self.#process) resolve()
            }, 100)
        })
        const d = self.#wd
        log('Answer sending... - ' + task.id)
        await d.open('https://youdo.com/t' + task.id)
        await (await d.cssLocated('.b-task-reactions__button')).click()
        await d.cssLocated('.b-dialog--add_offer__tpl__item')
        await (await d.cssLocated('.js-description')).sendKeys(answerText(task.answer))
        await (await d.cssLocated('label[for=\'Field__Insurance\']')).click()
        await (await d.cssLocated('.b-dialog--add_offer__price__value')).sendKeys(task.answer.price, KskWD.key.RETURN)
        await d.reload(3000)
        const place = await (await d.cssLocated('.b-task-block__offers__description__text')).getText()
        const visit = await (await d.cssLocated('li.item___72b99:nth-child(2)')).getText()
        log('Answer send! - ' + task.id)
        return place + '\n' + visit
    }
}
setTimeout(self.init, 1500)

module.exports = self