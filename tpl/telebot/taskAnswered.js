const data = require('../../data')
module.exports = function (task) {
    return `
--------------------
Задание №${task.id}, отклик отправлен!
--------------------

<b><a href="https://youdo.com/t${task.id}">${task.title}</a></b>

${task.text}

--------------------
Шаблон: ${data.answer.templateName[task.templateName]}
-------------------

${task.date}
-------------------
Время в отклике: ${data.answer.time[task.time[0]]} ${task.time[1] === '1' ? 'сейчас свободен' : ''}

--------------------

<a href="https://yandex.ru/maps/?text=${task.address}">${task.address}</a>

-------------------
${task.price} ${task.priceType}
-------------------
Предложенная оплата: ${task.priceAnswer}

--------------------
<a href="${task.nameLink}">${task.name}</a>
Имя в отклике: ${task.nameAnswer || 'без имени'}
-------------------
    `
}