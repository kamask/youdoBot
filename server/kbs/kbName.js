const Markup = require('telegraf/markup')
const cbb = Markup.callbackButton

module.exports = (id, name) => {
    return Markup.inlineKeyboard([
        [
            cbb(name.split(' ')[0], 'name_' + id + '_1'),
            cbb('Ввести', 'name_' + id + '_2'),
            cbb('Без имени', 'name_' + id + '_0')
        ],[
            cbb('Отмена', 'cancel_' + id)
        ]
    ])
}