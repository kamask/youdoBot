const log = (...m) => console.log(...m)
const TBot = require('./KskTelegramBot')
const Task = require('./KskYoudoTask')
const YBot = require('./KskYoudoBot')
const http = require('http')
let restart = false, stop = false, currentLtId = 0

http.createServer({}, TBot.listenWebhook).listen(3000)


const tasks = new Map()
global.exitApp = false
;(async function() {
    while(!exitApp){
        try{
            log('Bot runing!')

            await YBot.init()

            while(YBot.wdGT){

                if(restart) break
                if(stop){
                    exitApp = true
                    break
                }

                await YBot.wdGT.d.get('https://youdo.com/api/tasks/tasks/?q=&list=all&status=opened&lat=55.753215&lng=37.622504&radius=30&page=1&noOffers=false&onlySbr=false&onlyB2B=false&priceMin=&sortType=1&onlyVirtual=false&sub=30&sub=34&sub=32&sub=110&sub=84&sub=109&sub=90')
                const allTasks = await YBot.wdGT.d.executeScript(()=>{
                    return JSON.parse(document.querySelector('pre').innerText).ResultObject.Items
                })

                let i = 0
                while(currentLtId < allTasks[i].Id){
                    if(currentLtId === 0) currentLtId = allTasks[i].Id
                    log('\nNew task - ' + allTasks[i].Id + ' | ' + new Date().toLocaleString('ru-RU'))

                    let task = await (await new Task(allTasks[i].Id).get()).sendToTelegram()
                    tasks.set(task.id, task)
                    i++
                }

                if(currentLtId < allTasks[0].Id) currentLtId = allTasks[0].Id

                await YBot.wdGT.d.sleep(1000)

            }

            restart = false
            stop = false

        }catch (e) {
            console.error(e)
        }finally {
            YBot.wdGT = null
            YBot.wdTA = null
            currentLtId = 0
        }
    }
    log('ExitApp is True')

    if(TBot.auth) TBot.send('sendMessage', {text: 'ExitApp is True'})
})()




TBot.text('/start', m => {
    TBot.send('sendMessage', {text: m.chat.id}, m.chat.id)
    TBot.send('deleteMessage', {message_id: m.message_id}, m.chat.id)
})

TBot.send('sendMessage', {text: 'Bot running!'})

TBot.text('/restart', m => {
    restart = true
    TBot.send('sendMessage', {text: 'Bot restarting'})
    TBot.send('deleteMessage', {message_id: m.message_id})
})

TBot.text('/stop', m => {
    stop = true
    TBot.send('deleteMessage', {message_id: m.message_id})
})

TBot.text('last', m => {
    currentLtId = 0
    TBot.send('deleteMessage', {message_id: m.message_id})
})

TBot.text(/^id(\d+)$/, async m => {
    let task = await (await new Task(m.match[1]).get()).sendToTelegram()
    tasks.set(task.id, task)
    TBot.send('deleteMessage', {message_id: m.message_id})
})



TBot.callback(/^answer_(\d+)$/, async (match, mid) => {
    let task = tasks.get(match[1])
    if(!task){
        task = await new Task(match[1]).get()
        tasks.set(task.id, task)
    }
    task.answer = {}
    task.tgMsgId = mid
    TBot.send('editMessageReplyMarkup', {
        message_id: mid,
        reply_markup: {
            inline_keyboard: [
                [
                    {text: task.userName.split(' ')[0], callback_data: 'name_' + task.id + '_1'},
                    {text: 'Ввести', callback_data: 'name_' + task.id + '_2'},
                    {text: 'Без имени', callback_data: 'name_' + task.id + '_0'}
                ],[
                    {text: 'Отмена', callback_data: 'cancel_' + task.id}
                ]
            ]
        }
    })
})

let newNameTaskId = null
TBot.callback(/^name_(\d+)_(\d)$/, (match, mid) => {
    const task = tasks.get(match[1])
    newNameTaskId = task.id
    if(match[2] === '2'){
        TBot.send('editMessageText', {
            message_id: mid,
            text: task.fullInfo+'\n**************************\nВведи: "=Имя"',
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: []
            }
        })
    }else{
        setName(match[2] === '1' ? task.userName.split(' ')[0] : '')
    }
})

TBot.text(/^=([а-яА-ЯёЁ]{2,15}\s?[а-яА-ЯёЁ]{0,15})$/, m => {
    setName(m.match[1])
    TBot.send('deleteMessage', {message_id: m.message_id})
})

function setName(name){
    const task = tasks.get(newNameTaskId)
    newNameTaskId = null
    if(!task) return
    task.answer.name = name
    task.answer.textTg = task.fullInfo +
        '**************************\n' +
        'Задание №' + task.id + '\n' +
        'Имя в шаблоне: ' + (task.answer.name || 'без имени') +
        '\n--------------------------'

    TBot.send('editMessageText', {
        message_id: task.tgMsgId,
        text: task.answer.textTg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbTemplates')(task.id)
    })
}

const templateData = require('./templateData')
TBot.callback(/^template_(\d+)_(\d\d?)$/, (match, mid) => {
    const task = tasks.get(match[1])
    task.answer.templateName = match[2]
    task.answer.textTg += '\nШаблон: ' + templateData.templateName[task.answer.templateName] +
        '\n--------------------------'

    TBot.send('editMessageText', {
        message_id: mid,
        text: task.answer.textTg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbTime')(task.id)
    })
})

TBot.callback(/^time_(\d+)_(\d)(\d)$/, (match, mid) => {
    const task = tasks.get(match[1])
    task.answer.time = [match[2], match[3]]
    task.answer.textTg += '\nВремя: ' + templateData.time[task.answer.time[0]] +
        (match[3] === '1' ? ', сейчас свободен' : '') +
        '\n--------------------------'

    TBot.send('editMessageText', {
        message_id: mid,
        text: task.answer.textTg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: require('./kbs/kbPrice')(task.id)
    })
})

TBot.callback(/^price_(\d+)_(\d{3,5})$/, (match, mid) => {
    const task = tasks.get(match[1])
    task.answer.price = match[2]
    task.answer.textTg += '\nОплата: ' + task.answer.price +
        '\n**************************'

    TBot.send('editMessageText', {
        message_id: mid,
        text: task.answer.textTg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Подтвердить', callback_data: 'access_' + task.id},
                    {text: 'Отмена', callback_data: 'cancel_' + task.id}
                ]
            ]
        }
    })
})

TBot.callback(/^access_(\d+)$/, async (match, mid) => {
    const task = tasks.get(match[1])
    TBot.send('editMessageText', {
        message_id: mid,
        text: task.answer.textTg + '\n\n        Оставляю предложение...',
        disable_web_page_preview: true,
        parse_mode: "HTML"
    })
    const res = await task.sendAnswer()
    TBot.send('editMessageText', {
        message_id: mid,
        text: task.answer.textTg + '\n'+res,
        disable_web_page_preview: true,
        parse_mode: "HTML"
    })
})

TBot.callback(/^cancel_(\d+)$/, (match, mid) => {
    const task = tasks.get(match[1])
    delete task.answer

    TBot.send('editMessageText',{
        message_id: mid,
        text: task.fullInfo,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [{text:'Предложить помощь', callback_data: 'answer_'+task.id}]
            ]
        }
    })
})

