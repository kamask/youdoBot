const templateData = require('../templateData')
const Markup = require('telegraf/markup')
const cbb = Markup.callbackButton

module.exports = id => {
    return Markup.inlineKeyboard([
        [
            cbb(templateData.time[0], 'time_' + id + '_00'),
            cbb('Свободен', 'time_' + id + '_01')
        ],[
            cbb(templateData.time[1], 'time_' + id + '_10'),
            cbb('Свободен', 'time_' + id + '_11')
        ],[
            cbb(templateData.time[2], 'time_' + id + '_20'),
            cbb('Свободен', 'time_' + id + '_21')
        ],[
            cbb(templateData.time[3], 'time_' + id + '_30'),
            cbb('Свободен', 'time_' + id + '_31')
        ],[
            cbb(templateData.time[4], 'time_' + id + '_40'),
            cbb('Свободен', 'time_' + id + '_41')
        ],[
            cbb('Отмена', 'cancel_' + id)
        ]
    ])
}