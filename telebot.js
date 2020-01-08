const config = require('./config')
const data = require('./data')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

let chatId, state = {}, nameGeting = false, tasksHistory = {}
const bot = new Telegraf(config.telegramBotToken)

bot.start((ctx) => ctx.reply('Привет друг)\nНапиши своё любимое число)'))

bot.hears(data.startPass, ctx => {
    chatId = ctx.message.chat.id
    ctx.reply('Начинаю ловить задания)')

    send({
        id: '6865646',
        title: 'Установка ПО и офиса',
        text: 'Установить Windows и офис',
        date: 'Начать\n9 января 2020, 12:00\nЗавершить\n11 января 2020, 20:00',
        address: 'Керченская улица, 7, Москва',
        price: 'Средний — до 2 500 Р',
        priceType: 'Напрямую исполнителю без гарантий и компенсаций',
        name: 'Сергей Д.',
        nameLink: 'https://youdo.com/u317918'
    })
})

function send(task){
    tasksHistory[task.id] = task

    bot.telegram.sendMessage(chatId, `
------------------

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
    `, {
        disable_web_page_preview: true,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([Markup.callbackButton('Взять задание №'+task.id, 'answer_'+task.id)])
    })
}

bot.action(/^answer_(\d{6,8})$/, async ctx => {
    ctx.answerCbQuery('Тебя выберут, не сомневайся)')

    let task = ctx.match[1]
    state[task] = {name: tasksHistory[task].name}

    bot.telegram.sendMessage(chatId, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].name}
--------------------
    `, {reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton(state[task].name.split(' ')[0], 'name_'+task+'_0'),
            Markup.callbackButton('Без имени', 'name_'+task+'_1'),
            Markup.callbackButton('Ввести', 'name_'+task+'_2')
        ])})
})

bot.action(/^name_(\d{6,8})_(\d)$/,async ctx => {
    ctx.answerCbQuery()

    let task = ctx.match[1]
    state[task].name = ctx.match[2] === '0' ? ' '+state[task].name.split(' ')[0] : ctx.match[2] === '1' ? '' : '=Имя'

    if(ctx.match[2] === '2'){
        nameGeting = task
        bot.telegram.sendMessage(chatId, '=Имя')
    }else setTemplate(task)
})

bot.hears(/^=([а-яА-ЯёЁ]{2,15}\s?[а-яА-ЯёЁ]{0,15})$/, ctx => {
    if(nameGeting){
        state[nameGeting].name = ctx.match[1]
        setTemplate(nameGeting)
        nameGeting = false
    }
})

function setTemplate(task){
    bot.telegram.sendMessage(chatId, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].name}
--------------------
    `, {reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton(data.answer.templateName[0], 'template_'+task+'_0'),
                Markup.callbackButton(data.answer.templateName[1], 'template_'+task+'_1'),
                Markup.callbackButton(data.answer.templateName[2], 'template_'+task+'_2')
            ],[
                Markup.callbackButton(data.answer.templateName[3], 'template_'+task+'_3'),
                Markup.callbackButton(data.answer.templateName[4], 'template_'+task+'_4'),
                Markup.callbackButton(data.answer.templateName[5], 'template_'+task+'_5')
            ],[
                Markup.callbackButton(data.answer.templateName[6], 'template_'+task+'_6'),
                Markup.callbackButton(data.answer.templateName[7], 'template_'+task+'_7'),
                Markup.callbackButton(data.answer.templateName[8], 'template_'+task+'_8')
            ],[
                Markup.callbackButton(data.answer.templateName[9], 'template_'+task+'_9'),
                Markup.callbackButton(data.answer.templateName[10], 'template_'+task+'_10')
            ]
        ])})
}

bot.action(/^template_(\d{6,8})_(\d\d?)$/, async ctx=>{
    ctx.answerCbQuery()

    let task = ctx.match[1]
    state[task].templateName = ctx.match[2]

    bot.telegram.sendMessage(chatId, `
--------------------
Задание №${task}
--------------------
Шаблон: ${data.answer.templateName[state[task].templateName]}
--------------------
    `, { reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton(data.answer.time[0], 'time_'+task+'_00'),
                Markup.callbackButton('Свободен', 'time_'+task+'_01')
            ],[
                Markup.callbackButton(data.answer.time[1], 'time_'+task+'_10'),
                Markup.callbackButton('Свободен', 'time_'+task+'_11')
            ],[
                Markup.callbackButton(data.answer.time[2], 'time_'+task+'_20'),
                Markup.callbackButton('Свободен', 'time_'+task+'_21')
            ]
        ])})
})

bot.action(/^time_(\d{6,8})_(\d)(\d)$/, ctx => {
    ctx.answerCbQuery()

    let task = ctx.match[1]
    let time = ctx.match[2]
    state[task].time = [time, ctx.match[2]]

    bot.telegram.sendMessage(chatId, `
--------------------
Задание №${task}
--------------------
Время: ${data.answer.time[state[task].time[0]]} ${ctx.match[2] === '1' ? 'сейчас свободен' : ''}
--------------------
    `, { reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton(data.answer.time[0], 'time_'+task+'_00'),
                Markup.callbackButton('Свободен', 'time_'+task+'_01')
            ],[
                Markup.callbackButton(data.answer.time[1], 'time_'+task+'_10'),
                Markup.callbackButton('Свободен', 'time_'+task+'_11')
            ],[
                Markup.callbackButton(data.answer.time[2], 'time_'+task+'_20'),
                Markup.callbackButton('Свободен', 'time_'+task+'_21')
            ]
        ])})
})



bot.launch()

module.exports.send = send
