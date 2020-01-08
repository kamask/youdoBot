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

    tasksHistory[task.id].msgId = (await bot.telegram.sendMessage(chatId, `
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
    `, {reply_markup: Markup.inlineKeyboard([[
            Markup.callbackButton(state[task].name.split(' ')[0], 'name_'+task+'_0'),
            Markup.callbackButton('Без имени', 'name_'+task+'_1'),
            Markup.callbackButton('Ввести', 'name_'+task+'_2')
        ],[Markup.callbackButton('Отмена', 'cancel_'+task)]])})
})

bot.action(/^name_(\d{6,8})_(\d)$/,async ctx => {
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
    `, {
        reply_markup: Markup.inlineKeyboard([
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
                Markup.callbackButton(data.answer.templateName[9], 'template_'+task+'_9')
            ],[Markup.callbackButton('Отмена', 'cancel_'+task)]
        ])
    })
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
            ],[Markup.callbackButton('Отмена', 'cancel_'+task)]
        ])})
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
    `, { reply_markup: Markup.inlineKeyboard([
            [
                Markup.callbackButton('1000', 'price_'+task+'_1000'),
                Markup.callbackButton('1200', 'price_'+task+'_1200'),
                Markup.callbackButton('1500', 'price_'+task+'_1500'),
                Markup.callbackButton('1800', 'price_'+task+'_1800')
            ],[
                Markup.callbackButton('2000', 'price_'+task+'_2000'),
                Markup.callbackButton('2200', 'price_'+task+'_2200'),
                Markup.callbackButton('2500', 'price_'+task+'_2500'),
                Markup.callbackButton('2800', 'price_'+task+'_2800')
            ],[
                Markup.callbackButton('3000', 'price_'+task+'_3000'),
                Markup.callbackButton('3500', 'price_'+task+'_3500'),
                Markup.callbackButton('4000', 'price_'+task+'_4000'),
                Markup.callbackButton('4500', 'price_'+task+'_4500'),
                Markup.callbackButton('5000', 'price_'+task+'_5000'),
                Markup.callbackButton('5500', 'price_'+task+'_5500')
            ],[
                Markup.callbackButton('6000', 'price_'+task+'_6000'),
                Markup.callbackButton('6500', 'price_'+task+'_6500'),
                Markup.callbackButton('7000', 'price_'+task+'_7000'),
                Markup.callbackButton('8000', 'price_'+task+'_8000'),
                Markup.callbackButton('9000', 'price_'+task+'_9000')
            ],[
                Markup.callbackButton('10000', 'price_'+task+'_10000'),
                Markup.callbackButton('11000', 'price_'+task+'_11000'),
                Markup.callbackButton('12000', 'price_'+task+'_12000'),
                Markup.callbackButton('13000', 'price_'+task+'_13000'),
                Markup.callbackButton('15000', 'price_'+task+'_15000')
            ],[Markup.callbackButton('Отмена', 'cancel_'+task)]
        ])})
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

    bot.telegram.editMessageText(chatId, task.msgId, null, `
--------------------
Задание №${task.id}, отклик отправлен!
--------------------

<b><a href="https://youdo.com/t${task.id}">${task.title}</a></b>

${task.text}

--------------------
Шаблон: ${data.answer.templateName[task.templateName]}
-------------------

${task.date}
-------------------
Время в отклике: ${data.answer.time[task.time[0]]} ${task.time[1] === '1' ? 'сейчас свободен' : ''}

--------------------

<a href="https://yandex.ru/maps/?text=${task.address}">${task.address}</a>

-------------------
${task.price} ${task.priceType}
-------------------
Предложенная оплата: ${task.priceAnswer}

--------------------
<a href="${task.nameLink}">${task.name}</a>
Имя в отклике: ${task.nameAnswer || 'без имени'}
-------------------
    `, {
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
