const {startPass} = require('./data')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

module.exports = class self{
    #bot
    #chatId

    constructor(token) {
        this.#bot = new Telegraf(token)
        let delPassReq
        this.#bot.start(ctx => {
            delPassReq = ctx.message.message_id
            this.#bot.telegram.sendMessage(ctx.message.chat.id,'Назови своё любимое число)').then(ctx => {
                this.#bot.telegram.deleteMessage(ctx.chat.id, delPassReq)
                delPassReq = ctx.message_id
            })
        })
        this.#bot.hears(startPass, ctx => {
            this.#chatId = ctx.message.chat.id
            this.send('Ща всё будет)\nУдачи!')
            this.delete(delPassReq)
            this.delete(ctx.message.message_id)
        })
        this.#bot.launch()
    }

    send(t, o = undefined){
        if(!this.#chatId) return false
        return this.#bot.telegram.sendMessage(this.#chatId, t, o)
    }

    delete(msg){
        this.#bot.telegram.deleteMessage(this.#chatId, msg)
    }
}