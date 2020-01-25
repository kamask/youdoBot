function dateFormat(d){
    let now = new Date(), tomorrow = new Date(Date.now()+(1000*3600*24)), afterTomorrow = new Date(Date.now()+(1000*3600*48)), i = new Date(d)
    return i.getMonth() === now.getMonth() && i.getDate() === now.getDate() ? i.toLocaleString('ru', { hour: 'numeric', minute: 'numeric'}) :
        i.getMonth() === tomorrow.getMonth() && i.getDate() === tomorrow.getDate() ? 'завтра ' + i.toLocaleString('ru', { hour: 'numeric', minute: 'numeric'}) :
        i.getMonth() === afterTomorrow.getMonth() && i.getDate() === afterTomorrow.getDate() ?
        'послезавтра (' + i.toLocaleString('ru', { day: 'numeric', month: 'long'}) + ') ' + i.toLocaleString('ru', { hour: 'numeric', minute: 'numeric'}) :
            i.toLocaleString('ru', { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric'})
}
module.exports = function ({id, title, text, date, address, place, price, budget, secure, userName, userId, userRate}) {
    return `
№${id}  |  ${dateFormat(date.created)}

<b><a href="https://youdo.com/t${id}">${title}</a></b>
${text}
-------------------
${date.begin ? 'Начать: '+dateFormat(date.begin)+' ' : ''}${date.end ? 'Закончить: '+dateFormat(date.end) : ''}
-------------------
${address ? '<a href="https://yandex.ru/maps/?text='+address+'">'+address+'</a>\n'+place : place}
-------------------
${price || budget} ${secure ? 'Картой' : 'Наличкой'}
-------------------
<a href="http://youdo.com/u${userId}">${userName}</a>
Отзывы: ${userRate[0]} / ${userRate[1]}
-------------------
`
}