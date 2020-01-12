module.exports = function ({id, title, text, date, address, price, priceMethod, place, name, authorLink}) {
    date = date.split('\n')
    return `
№${id}

<b><a href="https://youdo.com/t${id}">${title}</a></b>

${text}

-------------------
${date[0]+': '+date[1]+(date[3] ? ('\n'+date[2]+': '+date[3]) : '')}
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