const templateData = require('./templateData')
module.exports = ({name, time, price, templateName }) => {
    let template = templateData.templateText[Number(templateName)]
    return `Здравствуйте${name ? ' '+name : ''}! Готов ${templateName === '9' ? 'приступить ' : 'приехать '} ${time[0] === '0' ? '' : templateData.time[Number(time[0])] + ' или '}в удобное для Вас время и дату${time[1] === '1' ? ', на данный момент свободен' : ''}. Согласен на ${price}руб.
${template ? template+'\n' : ''}Мой сайт-визитка с более подробной информацией - mskmaster.tilda.ws
Всю работу провожу быстро и качественно! Работаю на репутацию! Обращайтесь!
    `
}