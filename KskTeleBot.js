const {startPass} = require('./data')
const {telegramBotToken} = require('./config')
const Telegraf = require('telegraf')

module.exports = class self{
    #bot
    #chatId
    t
    m = require('telegraf/markup')

    constructor() {
        this.#bot = new Telegraf(telegramBotToken)
        this.t = this.#bot.telegram
        let delPassReq

        this.#bot.start(ctx => {
            delPassReq = ctx.message.message_id
            this.t.sendMessage(ctx.message.chat.id,'Назови своё любимое число)').then(ctx => {
                this.t.deleteMessage(ctx.chat.id, delPassReq)
                delPassReq = ctx.message_id
            })
        })

        this.#bot.hears(startPass, ctx => {
            this.#chatId = ctx.message.chat.id
            this.send('Ща всё будет)\nУдачи!')
            this.delete(delPassReq)
            this.delete(ctx.message.message_id)
        })

        tBot.t.action(/^answer_(\d{6,8})$/, async ctx => {
            ctx.answerCbQuery('Тебя выберут, не сомневайся)')

        })

        this.#bot.launch()
    }

    send(t, o = undefined){
        if(!this.#chatId) return false
        return this.#bot.telegram.sendMessage(this.#chatId, t, o)
    }

    delete(msg){
        if(!this.#chatId) return false
        return this.#bot.telegram.deleteMessage(this.#chatId, msg)
    }

    edit(msg, t, o = undefined){
        if(!this.#chatId) return false
        return this.#bot.telegram.editMessageText(this.#chatId, msg, null, t, o)
    }

    editMarkup(msg, m){
        if(!this.#chatId) return false
        return this.#bot.telegram.editMessageReplyMarkup(this.#chatId, msg, null, m)
    }
}