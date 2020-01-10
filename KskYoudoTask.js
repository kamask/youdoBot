function log(...p){console.log(...p)}
const KskWD = require('./KskWebDriver')
const AnswerTask = require('./KskAnswerTask')
const tBot = require('./KskTeleBot')

class self{
    static #wd = null
    static #process = false

    id
    info

    static async init(){
        self.#process = true
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth('Get Task Info')
        self.#process = false
        return self
    }

    static async build(id){
        log('\n---\nNew task - ' + id + ' | ' + new Date().toLocaleString('ru-RU'))
        if(!self.#wd && !self.#process) await self.init()
        if(self.#process) await new Promise(resolve => {  setInterval(()=>{ if(!self.#process) resolve() },100) })
        self.#process = true
        const d = self.#wd
        log('Task info getting - ' + id + ' ...')
        await d.open('https://youdo.com/t' + id)
        const info = {
            id,
            title: await (await d.cssLocated('.b-task-block__header__title')).getText(),
            text: await (await d.cssLocated('.b-task-block__description')).getText(),
            address: await (await d.cssLocated('.b-task-block__address > .b-task-block__info')).getText(),
            date: await (await d.cssLocated('.b-task-block__date__wrap')).getText(),
            price: await (await d.cssLocated('.b-task-block__budget > .b-task-block__info')).getText(),
            priceMethod: await (await d.cssLocated('.b-task-block__payment > .b-task-block__info')).getText(),
            place: await (await d.cssLocated('.b-task-block__location > .b-task-block__info')).getText(),
            name: await (await d.cssLocated('.b-task-block__userinfo__name')).getText(),
            authorLink: (await (await d.cssLocated('.b-task-block__userinfo__name')).getAttribute('href'))
        }
        log('Task info getting done! - ' + id + '\n---')
        self.#process = false
        return new self(id, info)
    }

    constructor(id, info){
        this.id = id
        this.info = info
    }

    sendToTelegramBot(){
        const cbb = tBot.m.callbackButton

        const taskSendedRes = tBot.send(require('./tpl/telebot/newTask')(this.info), {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: tBot.m.inlineKeyboard([cbb('Взять задание №' + this.id, 'answer_'+this.id)])
        })
        if(taskSendedRes) taskSendedRes.then(ctx => {
            this.telegramMessageId = ctx.message_id
        })

        tBot.action(/^answer_(\d{6,8})$/, ctx => {
            ctx.answerCbQuery('Тебя выберут, не сомневайся)')
            AnswerTask.build(ctx.match[1])
        })
    }
}

setTimeout(self.init, 1000)

module.exports = self
