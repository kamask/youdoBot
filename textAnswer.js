const data = require('./data')
module.exports = ({name, time, price, templateName }) => {
    let template = data.answer.templateText[Number(templateName)]
    return `Здравствуйте${name ? ' '+name : ''}! Готов ${templateName === '10' ? 'приступить' : 'приехать'} ${time[0] === '1' ? 'в течение часа или ' : time[0] === '2' ? ' в течение 30 мин. ' : ''}в удобное для Вас время и дату${time[1] === '1' ? ', на данный момент свободен' : ''}. Согласен на ${price}руб.
${template ? template+'\n' : ''}Мой сайт-визитка с более подробной информацией - mskmaster.tilda.ws
Всю работу провожу быстро и качественно! Работаю на репутацию!
Обращайтесь!
    `
}