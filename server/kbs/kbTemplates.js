const Markup = require('telegraf/markup')
const data = require('../data')
const cbb = Markup.callbackButton

module.exports = id => {
    return Markup.inlineKeyboard([
        [
            cbb(data.answer.templateName[0], 'template_'+id+'_0'),
            cbb(data.answer.templateName[1], 'template_'+id+'_1'),
            cbb(data.answer.templateName[2], 'template_'+id+'_2')
        ],[
            cbb(data.answer.templateName[3], 'template_'+id+'_3'),
            cbb(data.answer.templateName[4], 'template_'+id+'_4'),
            cbb(data.answer.templateName[5], 'template_'+id+'_5')
        ],[
            cbb(data.answer.templateName[6], 'template_'+id+'_6'),
            cbb(data.answer.templateName[7], 'template_'+id+'_7'),
            cbb(data.answer.templateName[8], 'template_'+id+'_8')
        ],[
            cbb(data.answer.templateName[9], 'template_'+id+'_9')
        ],[
            cbb('Отмена', 'cancel_'+id)
        ]
    ])
}