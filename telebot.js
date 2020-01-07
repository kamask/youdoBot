const config = require('./config')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const bot = new Telegraf(config.telegramBotToken)
bot.start((ctx) => ctx.reply('Привет друг)\nНапиши своё любимое число)'))
bot.launch()
let chatId

bot.hears('777888', ctx => {
    chatId = ctx.message.chat.id
    ctx.reply('Начинаю ловить задания)')
})

bot.action(/^answer_(\d{6,8})$/, async ctx => {
    await ctx.answerCbQuery('Гарику ПРУВЕТ!!!')
    let task = ctx.match[1]
    ctx.telegram.sendMessage(ctx.chat.id, `
Задание №${task}
    Гарику прувет!!!
    `)
})

module.exports.send = function (task) {
    bot.telegram.sendMessage(chatId, `

<b><a href="https://youdo.com/t${task.id}">${task.title}</a></b>

${task.text}

-------------------
${task.date}
-------------------

<a href="https://yandex.ru/maps/?text=${task.address}">${task.address}</a>

-------------------
${task.price} ${task.priceType}
-------------------
<a href="${task.nameLink}">${task.name}</a>

-------------------
    `, {disable_web_page_preview: true, parse_mode: "HTML", reply_markup: Markup.inlineKeyboard([Markup.callbackButton('Работаем)', 'answer_'+task.id)])})
}