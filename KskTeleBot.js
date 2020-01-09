const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

module.exports = class self{
    #bot
    #chatId

    constructor(token) {
        this.#bot = new Telegraf(token)
        this.#bot.start(ctx => {
            this.#chatId = ctx.update.message.chat.id
        })
        this.#bot.launch()
    }

    send(t){
        this.#bot.telegram.sendMessage(this.#chatId, t)
    }
}