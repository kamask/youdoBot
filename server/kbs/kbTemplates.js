const Markup = require('telegraf/markup')
const templateData = require('../templateData')
const cbb = Markup.callbackButton

module.exports = id => {
    return Markup.inlineKeyboard([
        [
            cbb(templateData.templateName[0], 'template_'+id+'_0'),
            cbb(templateData.templateName[1], 'template_'+id+'_1'),
            cbb(templateData.templateName[2], 'template_'+id+'_2'),
        ],[
            cbb(templateData.templateName[3], 'template_'+id+'_3'),
            cbb(templateData.templateName[4], 'template_'+id+'_4'),
        ],[
            cbb(templateData.templateName[5], 'template_'+id+'_5'),
            cbb(templateData.templateName[6], 'template_'+id+'_6'),
            cbb(templateData.templateName[7], 'template_'+id+'_7'),
        ],[
            cbb(templateData.templateName[8], 'template_'+id+'_8'),
            cbb(templateData.templateName[9], 'template_'+id+'_9'),
        ],[
            cbb('Отмена', 'cancel_'+id)
        ]
    ])
}