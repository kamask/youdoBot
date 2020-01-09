const data = require('../data')
module.exports = task => {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(data.answer.time[0], 'time_'+task+'_00'),
            Markup.callbackButton('Свободен', 'time_'+task+'_01')
        ],[
            Markup.callbackButton(data.answer.time[1], 'time_'+task+'_10'),
            Markup.callbackButton('Свободен', 'time_'+task+'_11')
        ],[
            Markup.callbackButton(data.answer.time[2], 'time_'+task+'_20'),
            Markup.callbackButton('Свободен', 'time_'+task+'_21')
        ],[
            Markup.callbackButton('Отмена', 'cancel_'+task)
        ]
    ])
}