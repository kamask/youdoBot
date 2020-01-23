const Telegraf = require('telegraf')

class self {

    #bot
    #chatId

    m = require('telegraf/markup')

    constructor(token, chatId) {
        this.#chatId = chatId
        this.#bot = new Telegraf(token)
        this.t = this.#bot.telegram

        this.#bot.start(ctx => {
            let delPassReq = ctx.message.message_id
            ctx.reply('Chat id: '+ctx.message.chat.id).then(ctx => {
                this.t.deleteMessage(ctx.chat.id, delPassReq)
            })
        })

        this.#bot.launch()
    }

    send(text, opt = undefined) {
        if (!this.#chatId) return false
        return this.t.sendMessage(this.#chatId, text, opt)
    }

    photo(src){
        if (!this.#chatId) return false
        this.#bot.telegram.sendPhoto(this.#chatId, src)
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

    action(trigger, handler){
        this.#bot.action(trigger, handler)
    }

    hears(trigger, handler){
        this.#bot.hears(trigger, handler)
    }
}

bot = new self(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID)

module.exports = bot