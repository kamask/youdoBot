const Markup = require('telegraf/markup')
const data = require('../data')
module.exports = task => {
    return Markup.inlineKeyboard([
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
        ],[
            Markup.callbackButton('Отмена', 'cancel_'+task)
        ]
    ])
}