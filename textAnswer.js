const data = require('./data')
module.exports = ({name, time, price, templateName }) => {
    let template = data.answer.templateText[Number(templateName)]
    return `Здравствуйте${name ? ' '+name : ''}! Готов ${templateName === '10' ? 'приступить ' : 'приехать '} ${time[0] === '0' ? '' : data.answer.time[Number(time[0])] + ' или '}в удобное для Вас время и дату${time[1] === '1' ? ', на данный момент свободен' : ''}. Согласен на ${price}руб.
${template ? template+'\n' : ''}Мой сайт-визитка с более подробной информацией - mskmaster.tilda.ws
Всю работу провожу быстро и качественно! Работаю на репутацию!
Обращайтесь!
    `
}