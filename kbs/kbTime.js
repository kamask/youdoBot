const data = require('../data')
const Markup = require('telegraf/markup')
const cbb = Markup.callbackButton

module.exports = id => {
    return Markup.inlineKeyboard([
        [
            cbb(data.answer.time[0], 'time_' + id + '_00'),
            cbb('Свободен', 'time_' + id + '_01')
        ],[
            cbb(data.answer.time[1], 'time_' + id + '_10'),
            cbb('Свободен', 'time_' + id + '_11')
        ],[
            cbb(data.answer.time[2], 'time_' + id + '_20'),
            cbb('Свободен', 'time_' + id + '_21')
        ],[
            cbb(data.answer.time[3], 'time_' + id + '_30'),
            cbb('Свободен', 'time_' + id + '_31')
        ],[
            cbb(data.answer.time[4], 'time_' + id + '_40'),
            cbb('Свободен', 'time_' + id + '_41')
        ],[
            cbb('Отмена', 'cancel_' + id)
        ]
    ])
}