const {startPass} = require('./data')
const {telegramBotToken} = require('./config')
const Telegraf = require('telegraf')

class self {
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
            this.t.sendMessage(ctx.message.chat.id, 'Назови своё любимое число)').then(ctx => {
                this.t.deleteMessage(ctx.chat.id, delPassReq)
                delPassReq = ctx.message_id
            })
        })

        this.#bot.hears(startPass, ctx => {
            this.#chatId = ctx.message.chat.id
            this.send('Ща всё будет)\nУдачи!')
            if(delPassReq){
                this.delete(delPassReq)
                delPassReq = null
            }
            this.delete(ctx.message.message_id)
        })

        this.#bot.launch()
    }

    send(text, opt = undefined) {
        if (!this.#chatId) return false
        return this.t.sendMessage(this.#chatId, text, opt)
    }

    delete(msg) {
        if (!this.#chatId) return false
        return this.t.deleteMessage(this.#chatId, msg)
    }

    edit(msg, text, opt = undefined) {
        if (!this.#chatId) return false
        return this.t.editMessageText(this.#chatId, msg, null, text, opt)
    }

    editMarkup(msg, mark) {
        if (!this.#chatId) return false
        return this.t.editMessageReplyMarkup(this.#chatId, msg, null, mark)
    }

    action(action, handle) {
        this.#bot.action(action, handle)
    }
}

bot = new self()

module.exports = bot