module.exports = function (task) {
    return `
------------------

<b><a href="https://youdo.com/t${task.id}">${task.title}</a></b>

${task.text}

-------------------
${task.date}
-------------------

<a href="https://yandex.ru/maps/?text=${task.address}">${task.address}</a>

-------------------
${task.price} ${task.priceType}
-------------------

<a href="${task.nameLink}">${task.name}</a>

-------------------
    `
}