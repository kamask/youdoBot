const log = (...m) => console.log(...m)
const TBot = require('./KskTelegramBot')
const YBot = require('./KskYoudoBot')
const rp = require('request-promise')

class self{
    constructor(id){
        this.id = id
        this.fullInfo = ''
    }

    async get(){
        await YBot.wdGT.d.get('https://youdo.com/api/tasks/taskmodel/?taskId='+this.id)
        let taskFull = await YBot.wdGT.d.executeScript(()=>{
            return JSON.parse(document.querySelector('pre').innerText).ResultObject
        })

        try{ this.place = taskFull.AttributesValues.Location.Concatenated }catch(e){ this.place = '' }
        taskFull = taskFull.TaskData
        this.title = taskFull.Title
        this.price = taskFull.Price.Amount || null
        this.budget = !taskFull.Price.Amount ? taskFull.Price.PriceInHeader.StringFormat : null
        this.secure = taskFull.IsSbr
        this.address = taskFull.Addresses.length > 0 ? taskFull.Addresses[0].Address : null
        this.userName = taskFull.CreatorInfo.UserInfo.UserName
        this.userAvatar = "https://avatar.youdo.com/get.userAvatar?AvatarId="+taskFull.CreatorInfo.UserInfo.Avatar.Id+"&AvatarType=H180W180"
        this.userId = taskFull.CreatorInfo.UserInfo.Id
        this.userRate = [taskFull.CreatorInfo.Scores.PositiveReviews, taskFull.CreatorInfo.Scores.NegativeReviews]
        this.text = taskFull.Description
        this.date = {created: taskFull.Dates.CreationDate}
        this.date.begin = taskFull.Dates.NeedBeginDate
        this.date.end = taskFull.Dates.NeedEndDate
        this.photo = []
        if(taskFull.Media.length > 0){
            taskFull.Media.forEach(j=>{
                this.photo.push('https://content3.youdo.com/get.content?ContentId='+j.Id+'&size=Max1600')
            })
        }
        this.fullInfo = `
№${this.id}  |  ${dateFormat(this.date.created)}

<b><a href="https://youdo.com/t${this.id}">${this.title}</a></b>
${this.text}
-------------------
${this.date.begin ? 'Начать: '+dateFormat(this.date.begin)+' ' : ''}${this.date.end ? '\nЗакончить: '+dateFormat(this.date.end) : ''}
-------------------
${this.address ? '<a href="https://yandex.ru/maps/?text='+this.address+'">'+this.address+'</a>\n'+this.place : this.place}
-------------------
${this.price || this.budget} ${this.secure ? 'Картой' : 'Наличкой'}
-------------------
<a href="http://youdo.com/u${this.userId}">${this.userName}</a>
Отзывы: ${this.userRate[0]} / ${this.userRate[1]}
-------------------
`
        function dateFormat(d){
            let now = new Date(), tomorrow = new Date(Date.now()+(1000*3600*24)), afterTomorrow = new Date(Date.now()+(1000*3600*48)), i = new Date(d)
            return i.getMonth() === now.getMonth() && i.getDate() === now.getDate() ? i.toLocaleString('ru-RU', { hour: 'numeric', minute: 'numeric'}) :
                i.getMonth() === tomorrow.getMonth() && i.getDate() === tomorrow.getDate() ? 'завтра ' + i.toLocaleString('ru-RU', { hour: 'numeric', minute: 'numeric'}) :
                    i.getMonth() === afterTomorrow.getMonth() && i.getDate() === afterTomorrow.getDate() ?
                        'послезавтра (' + i.toLocaleString('ru-RU', { day: 'numeric', month: 'long'}) + ') ' + i.toLocaleString('ru-RU', { hour: 'numeric', minute: 'numeric'}) :
                        i.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric'})
        }
        return this
    }

    async sendToTelegram(){

        await TBot.send('sendMessage',{
            text: this.fullInfo,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{text:'Предложить помощь', callback_data: 'answer_'+this.id}]
                ]
            }
        })

        if(this.address) rp(encodeURI('https://geocode-maps.yandex.ru/1.x/?apikey='+process.env.YMAP_API_KEY+'&results=1&format=json&geocode='+this.address))
            .then(res => {
                const point = JSON.parse(res).response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ').join(',')
                TBot.send('sendPhoto', {photo: 'https://static-maps.yandex.ru/1.x/?l=map&ll='+point+'&z=13&pt='+point+',vkbkm', caption: this.title})
            })

        const avatarId = this.userAvatar.split('?')[1].split('&')[0].split('=')[1]
        if(avatarId !== '0') TBot.send('sendPhoto',{photo: this.userAvatar, caption: this.userName+' '+this.title})
        if(this.photo.length > 0){
            this.photo.forEach(i => {
                TBot.send('sendPhoto',{photo: i, caption: this.title})
            })
        }

        return this
    }

    async sendAnswer(){
        const templateData = require('./templateData')
        let template = templateData.templateText[Number(this.answer.templateName)]
        let place, visit, text = `Здравствуйте${this.answer.name ? ' '+this.answer.name : ''}! Готов ${this.answer.templateName === '9' ? 'приступить ' : 'приехать '} ${this.answer.time[0] === '0' ? '' : templateData.time[Number(this.answer.time[0])] + ' или '}в удобное для Вас время и дату${this.answer.time[1] === '1' ? ', на данный момент свободен' : ''}. Согласен на ${this.answer.price}руб.

${template ? template+'\n' : ''}Мой сайт-визитка с более подробной информацией - mskmaster.tilda.ws

Всю работу провожу быстро и качественно! Работаю на репутацию!
Обращайтесь!
`

        await YBot.wdTA.d.get('https://youdo.com/t' + this.id)
        await YBot.wdTA.find({css: '.b-task-reactions__button'})
        await YBot.wdTA.d.executeScript("document.querySelector('.b-task-reactions__button').click()")
        await YBot.wdTA.find({css: '.dialog__content > form'})

        await (await YBot.wdTA.d.findElement({css: '.b-dialog--add_offer__description > textarea'})).sendKeys(text)
        await (await YBot.wdTA.d.findElement({css: '.label[for="Field__Insurance"]'})).click()
        await (await YBot.wdTA.d.findElement({css: '.b-dialog--add_offer__price__value'})).sendKeys(this.answer.price, YBot.wdTA.key.RETURN)

        await YBot.wdTA.reload(3000)

        place = await (await YBot.wdTA.find({css: '.b-task-block__offers__description__text'})).getText()
        visit = await (await YBot.wdTA.d.findElement({css: 'li.item___72b99:nth-child(2)'})).getText()

        return place + '\n' + visit
    }
}

module.exports = self
