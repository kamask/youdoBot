const Markup = require('telegraf/markup')
module.exports = function (task) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(task.name.split(' ')[0], 'name_'+task.id+'_0'),
            Markup.callbackButton('Без имени', 'name_'+task.id+'_1'),
            Markup.callbackButton('Ввести', 'name_'+task.id+'_2')
        ],[
            Markup.callbackButton('Отмена', 'cancel_'+task.id)
        ]
    ])
}