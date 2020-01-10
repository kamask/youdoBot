module.exports = function ({id, title, text, date, address, price, priceMethod, place, name, authorLink}) {
    return `
<b><a href="https://youdo.com/t${id}">${title}</a></b>

${text}

-------------------
${date}
-------------------

<a href="https://yandex.ru/maps/?text=${address}">${address}</a>

${place}

-------------------
${price} ${priceMethod}
-------------------

<a href="${authorLink}">${name}</a>

-------------------
    `
}