const config = require('./config')
const data = require('./data')
const answerTask = require('./answerTask')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')

const bot = new Telegraf(config.telegramBotToken)
const state = {}
const tasksHistory = {}

let chatId = null, nameGeting = false

bot.start((ctx) => ctx.reply('Привет друг)\nНапиши своё любимое число)'))

bot.hears(data.startPass, ctx => {
    chatId = ctx.message.chat.id
    bot.telegram.deleteMessage(chatId, ctx.update.message.message_id)
    ctx.reply('Начинаю ловить задания)')

    // ****************Testing*********************
    // send({
    //     id: '6865646',
    //     title: 'Установка ПО и офиса',
    //     text: 'Установить Windows и офис',
    //     date: 'Начать\n9 января 2020, 12:00\nЗавершить\n11 января 2020, 20:00',
    //     address: 'Керченская улица, 7, Москва',
    //     price: 'Средний — до 2 500 Р',
    //     priceType: 'Напрямую исполнителю без гарантий и компенсаций',
    //     name: 'Сергей Д.',
    //     nameLink: 'https://youdo.com/u317918'
    // })
})

async function send(task){
    if(!chatId) return

    tasksHistory[task.id] = task

    tasksHistory[task.id].msgId = (await bot.telegram.sendMessage(chatId, require('./tpl/telebot/newTask')(task), {
        disable_web_page_preview: true,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([Markup.callbackButton('Взять задание №'+task.id, 'answer_'+task.id)])
    })).message_id
    return 777
}

bot.action(/^answer_(\d{6,8})$/, async ctx => {
    ctx.answerCbQuery('Тебя выберут, не сомневайся)')
    const task = ctx.match[1]

    state[task] = tasksHistory[task]
    bot.telegram.editMessageReplyMarkup(chatId, state[task].msgId, null, {})

    bot.telegram.sendMessage(chatId, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].name}
--------------------
    `, {reply_markup: require('./kbs/kbName')(state[task])})
})

bot.action(/^name_(\d{6,8})_(\d)$/, async ctx => {
    ctx.answerCbQuery()
    const mid = ctx.update.callback_query.message.message_id
    const task = ctx.match[1]

    state[task].nameAnswer = ctx.match[2] === '0' ? ' '+state[task].name.split(' ')[0] : ctx.match[2] === '1' ? '' : '=Имя'

    if(ctx.match[2] === '2') nameGeting = task+'-'+mid+'-'+(await bot.telegram.sendMessage(chatId, '=Имя')).message_id
    else setTemplate(task, mid)
})

bot.hears(/^=([а-яА-ЯёЁ]{2,15}\s?[а-яА-ЯёЁ]{0,15})$/, ctx => {
    bot.telegram.deleteMessage(chatId, ctx.update.message.message_id)
    if(nameGeting){
        nameGeting = nameGeting.split('-')
        state[nameGeting[0]].nameAnswer = ctx.match[1]
        setTemplate(...nameGeting)
        nameGeting = false
    }
})

function setTemplate(task, mid, delmid = null){


    if(delmid) bot.telegram.deleteMessage(chatId, delmid)
    bot.telegram.editMessageText(chatId, mid, null, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].nameAnswer || 'без имени'}
--------------------
    `, {reply_markup: require('./kbs/kbTemplates')(task)})
}

bot.action(/^template_(\d{6,8})_(\d\d?)$/, async ctx=>{
    ctx.answerCbQuery()

    const mid = ctx.update.callback_query.message.message_id
    const task = ctx.match[1]

    state[task].templateName = ctx.match[2]

    bot.telegram.editMessageText(chatId, mid, null, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].nameAnswer || 'без имени'}
--------------------
Шаблон: ${data.answer.templateName[state[task].templateName]}
--------------------
    `, { reply_markup: require('./kbs/kbTime')(task)})
})

bot.action(/^time_(\d{6,8})_(\d)(\d)$/, ctx => {
    ctx.answerCbQuery()
    const mid = ctx.update.callback_query.message.message_id
    const task = ctx.match[1]

    state[task].time = [ctx.match[2], ctx.match[3]]

    bot.telegram.editMessageText(chatId, mid, null, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].nameAnswer || 'без имени'}
--------------------
Шаблон: ${data.answer.templateName[state[task].templateName]}
--------------------
Время: ${data.answer.time[state[task].time[0]]} ${ctx.match[3] === '1' ? 'сейчас свободен' : ''}
--------------------
    `, { reply_markup: require('./kbs/kbPrice')(task)})
})

bot.action(/^price_(\d{6,8})_(\d{4,5})$/, ctx => {
    ctx.answerCbQuery()

    const mid = ctx.update.callback_query.message.message_id
    const task = ctx.match[1]

    state[task].priceAnswer = ctx.match[2]

    bot.telegram.editMessageText(chatId, mid, null, `
--------------------
Задание №${task}
--------------------
Имя: ${state[task].nameAnswer || 'без имени'}
--------------------
Шаблон: ${data.answer.templateName[state[task].templateName]}
--------------------
Время: ${data.answer.time[state[task].time[0]]} ${state[task].time[1] === '1' ? 'сейчас свободен' : ''}
--------------------
Оплата: ${state[task].priceAnswer}
--------------------
    `, { reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton('Подтвердить', 'access_'+task),
            Markup.callbackButton('Отмена', 'cancel_'+task)
        ])})
})

bot.action(/^access_(\d{6,8})$/, async ctx => {
    ctx.answerCbQuery()
    const mid = ctx.update.callback_query.message.message_id
    const task = state[ctx.match[1]]

    bot.telegram.editMessageText(chatId, mid, null, `
--------------------
Задание №${task.id}
--------------------
Имя: ${task.nameAnswer || 'без имени'}
--------------------
Шаблон: ${data.answer.templateName[task.templateName]}
--------------------
Время: ${data.answer.time[task.time[0]]} ${task.time[1] === '1' ? 'сейчас свободен' : ''}
--------------------
Оплата: ${task.priceAnswer}
--------------------

            Отправка отклика...
    `, { reply_markup: Markup.inlineKeyboard([
            Markup.callbackButton('Отмена', 'cancel_'+task.id)
        ])})

    await answerTask(task)

    bot.telegram.editMessageText(chatId, task.msgId, null, require('./tpl/telebot/taskAnswered'), {
        disable_web_page_preview: true,
        parse_mode: "HTML"
    })

    bot.telegram.deleteMessage(chatId, mid)
})

bot.action(/^cancel_(\d{6,8})$/, ctx => {
    ctx.answerCbQuery()
    const mid = ctx.update.callback_query.message.message_id

    bot.telegram.deleteMessage(chatId, mid)
    bot.telegram.editMessageReplyMarkup(chatId, state[ctx.match[1]].msgId, null, Markup.inlineKeyboard([Markup.callbackButton('Взять задание №'+state[ctx.match[1]].id, 'answer_'+state[ctx.match[1]].id)]))
})

bot.launch()

module.exports.send = send
