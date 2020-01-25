const app = require('connect')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const req = require('request-promise')
const tBot = require('./KskTeleBot')
const cbb = tBot.m.callbackButton
const textNewTask = require('./textNewTask')
const textAnswer = require('./textAnswer')
const tasks = new Map()
const templateData = require('./templateData')
let answerData = false

server.listen(3000)

app.use((req, res)=>{
    res.writeHead(404)
    res.end('404: Not Found')
})

io.on('connection', socket=> {

    socket.emit('kskTBot', 'Telegram Bot connected!')
    socket.on('kskConnect', data => {
        tBot.send(data + ' connected!')
    })

    socket.on('kskNewTask', async data => {
        if(data.address) req(encodeURI('https://geocode-maps.yandex.ru/1.x/?apikey='+process.env.YMAP_API_KEY+'&results=1&format=json&geocode='+data.address))
            .then(res => {
                const point = JSON.parse(res).response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ').join(',')
                tBot.photo('https://static-maps.yandex.ru/1.x/?l=map&ll='+point+'&z=13&pt='+point+',vkbkm')
            })
        data.id = String(data.id)
        tasks.set(data.id, data)
        let task = tasks.get(data.id)

        task.tgMsgId = (await tBot.send(textNewTask(task), {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: tBot.m.inlineKeyboard([cbb('Предложить помощь', 'answer_'+data.id)])
        })).message_id
        const avatarId = task.userAvatar.split('?')[1].split('&')[0].split('=')[1]
        if(avatarId !== '0') tBot.photo(task.userAvatar)
        if(task.photo.length > 0){
            task.photo.forEach(i => {
                tBot.photo(i)
            })
        }
    })

    socket.on('kskAnswerData', data => {
        answerData = data
    })
})

tBot.action(/^answer_(\d{6,10})$/, ctx => {
    ctx.answerCbQuery('Тебя выберут, не сомневайся)')
    if(answerData === 'Answer'){
        answerData = 'Ожидание ответа прервано!'
        io.sockets.emit('kskLog', 'Answer make canceled - Aborted!')
    }
    const task = tasks.get(ctx.match[1])
    io.sockets.emit('kskLog', '\n---\nAnswer make - '+task.id)
    ctx.editMessageReplyMarkup(require('./kbs/kbName')(task.id, task.userName))
    task.answer = {}
})

let waitNewNameForAnswer = {id: null, idMsg: null}

tBot.action(/^name_(\d{6,10})_(\d)$/, async ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    waitNewNameForAnswer.id = task.id
    if(ctx.match[2] === '2') waitNewNameForAnswer.idMsg = (await ctx.reply('Как будем обращаться? (=Имя)')).message_id
    else setName(ctx.match[2] === '1' ? task.userName.split(' ')[0] : '')
})

tBot.hears(/^=([а-яА-ЯёЁ]{2,15}\s?[а-яА-ЯёЁ]{0,15})$/, ctx => {
    if(waitNewNameForAnswer.idMsg){
        tBot.delete(waitNewNameForAnswer.idMsg)
        waitNewNameForAnswer.idMsg = null
        setName(ctx.match[1])
    }
    ctx.deleteMessage()
})

function setName(name){
    const task = tasks.get(waitNewNameForAnswer.id)
    waitNewNameForAnswer.id = null
    task.answer.name = name
    task.answer.textTg = textNewTask(task) +
        '**************************\n' +
        'Задание №' + task.id + '\n' +
        'Имя в шаблоне: ' + (task.answer.name || 'без имени') +
        '\n--------------------------'

    tBot.edit(task.tgMsgId, task.answer.textTg, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbTemplates')(task.id)
    })
}

tBot.action(/^template_(\d{6,10})_(\d\d?)$/, ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    task.answer.templateName = ctx.match[2]
    task.answer.textTg += '\nШаблон: ' + templateData.templateName[task.answer.templateName] +
        '\n--------------------------'

    ctx.editMessageText(task.answer.textTg, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbTime')(task.id)
    })
})

tBot.action(/^time_(\d{6,10})_(\d)(\d)$/, ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    task.answer.time = [ctx.match[2], ctx.match[3]]
    task.answer.textTg += '\nВремя: ' + templateData.time[task.answer.time[0]] +
        (ctx.match[3] === '1' ? ', сейчас свободен' : '') +
        '\n--------------------------'

    ctx.editMessageText(task.answer.textTg, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbPrice')(task.id)
    })
})

tBot.action(/^price_(\d{6,10})_(\d{3,5})$/, ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    task.answer.price = ctx.match[2]
    task.answer.textTg += '\nОплата: ' + task.answer.price +
        '\n**************************'

    ctx.editMessageText(task.answer.textTg, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: tBot.m.inlineKeyboard([
            cbb('Подтвердить', 'access_' + task.id),
            cbb('Отмена', 'cancel_' + task.id)
        ])
    })
})

tBot.action(/^access_(\d{6,10})$/, ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    ctx.editMessageText(task.answer.textTg + '\n\n        Оставляю предложение...', {
        disable_web_page_preview: true,
        parse_mode: "HTML"
    })

    io.sockets.emit('kskAnswer', {id: task.id, price: task.answer.price, text: textAnswer(task.answer)})
    answerData = 'Answer'
    new Promise(resolve => {
        let i = 0
        setInterval(()=>{
            if((answerData && answerData !== 'Answer') || i > 120){
                if(answerData === 'Answer'){
                    io.sockets.emit('kskLog', 'Answer make canceled - ' + task.id + ' - TimeOut!')
                    answerData = false
                }
                resolve(answerData)
            }
            i++
        }, 500)
    }).then(answered => {
        answerData = false
        ctx.editMessageText(task.answer.textTg + '\n' + (answered || 'Время истекло, результат не известен'), {
            disable_web_page_preview: true,
            parse_mode: "HTML"
        })
    })

})

tBot.action(/^cancel_(\d{6,10})$/, ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    delete task.answer
    io.sockets.emit('kskLog', 'Answer make canceled - '+task.id)

    ctx.editMessageText(textNewTask(task), {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: tBot.m.inlineKeyboard([cbb('Предложить помощь', 'answer_'+task.id)])
    })
})
