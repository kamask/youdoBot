function detectDate(d){
    const ds = d.split(' ')
    const td = new Date().toLocaleString('ru', { day: 'numeric', month: 'long'})
    const tm = new Date(Date.now()+(1000*3600*24)).toLocaleString('ru', { day: 'numeric', month: 'long'})
    const ttm = new Date(Date.now()+(1000*3600*48)).toLocaleString('ru', { day: 'numeric', month: 'long'})
    return (ds[0] + ' ' + ds[1]) === td ? 'Сегодня ' + ds[3] :
        (ds[0] + ' ' + ds[1]) === tm ? 'Завтра ' + ds[3] :
            (ds[0] + ' ' + ds[1]) === ttm ? 'Послезавтра(' + (ds[0] + ' ' + ds[1]) + ') ' + ds[3] : d
}
module.exports = function ({id, title, text, date, address, price, priceMethod, place, name, authorLink}) {
    date = date.split('\n')
    return `
№${id}

<b><a href="https://youdo.com/t${id}">${title}</a></b>

${text}

-------------------
${date[0]+': '+detectDate(date[1])+(date[3] ? ('\n'+date[2]+': '+detectDate(date[3])) : '')}
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