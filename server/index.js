const app = require('connect')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const req = require('request-promise')
const tBot = require('./KskTeleBot')
const cbb = tBot.m.callbackButton
const textNewTask = require('./textNewTask')
const tasks = new Map()

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

    socket.on('kskNewTask', ({id, title}) => {
        tBot.send('<a href="https://youdo.com/t'+id+'">'+title+'</a>', { disable_web_page_preview: true, parse_mode: 'HTML'})
    })

    socket.on('kskTaskFullInfo', async data => {
        if(data.address !== 'Виртуальное задание') req(encodeURI('https://geocode-maps.yandex.ru/1.x/?apikey='+process.env.YMAP_API_KEY+'&results=1&format=json&geocode='+data.address))
            .then(res => {
                const point = JSON.parse(res).response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ').join(',')
                tBot.photo('https://static-maps.yandex.ru/1.x/?l=map&ll='+point+'&z=13&pt='+point+',vkbkm')
            })

        tasks.set(data.id, data)
        let task = tasks.get(data.id)

        task.tgMsgId = (await tBot.send(textNewTask(task), {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: tBot.m.inlineKeyboard([cbb('Предложить помощь', 'answer_'+task.id)])
        })).message_id
    })
})



tBot.action(/^answer_(\d{6,10})$/, ctx => {
    ctx.answerCbQuery('Тебя выберут, не сомневайся)')
    const task = tasks.get(ctx.match[1])
    io.sockets.emit('kskLog', '\n---\nAnswer make - '+task.id)
    ctx.editMessageReplyMarkup(require('./kbs/kbName')(task.id, task.name))
    task.answer = {}
})

let waitNewNameForAnswer = {id: null, idMsg: null}

tBot.action(/^name_(\d{6,10})_(\d)$/, async ctx => {
    ctx.answerCbQuery()
    const task = tasks.get(ctx.match[1])
    waitNewNameForAnswer.id = task.id
    if(ctx.match[2] === '2') waitNewNameForAnswer.idMsg = (await ctx.reply('Как будем обращаться? (=Имя)')).message_id
    else setName(ctx.match[2] === '1' ? task.name.split(' ')[0] : '')
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
        'Задание №' + task.id + '\n\n' +
        'Имя в шаблоне: ' + (task.answer.name || 'без имени') +
        '\n--------------------------'

    tBot.edit(task.tgMsgId, task.answer.textTg, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbTemplates')(task.id)
    })
}







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
