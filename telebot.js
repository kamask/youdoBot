const config = require('./config')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const bot = new Telegraf(config.telegramBotToken)
bot.start((ctx) => ctx.reply('Привет друг)\nНапиши своё любимое число)'))
bot.launch()
let chatId

bot.hears('777888', ctx => {
    chatId = ctx.message.chat.id
    ctx.reply('Начинаю ловить задания)')
})

bot.hears(/^\/answer_\d{6,8}$/, ctx => {
    let task = ctx.message.text.split('_')[1]
    ctx.reply(`
Задание №${task}

    `, Markup.keyboard(['/simple', '/inline', '/pyramid'])
        .oneTime()
        .resize()
        .extra())
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

/answer_${task.id}

-------------------

    `, {parse_mode: "HTML", disable_web_page_preview: true})
}