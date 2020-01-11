function log(...p){console.log(...p)}
const data = require('./data')
const textNewTask = require('./tpl/telebot/newTask')
const KskWD = require('./KskWebDriver')
const tBot = require('./KskTeleBot')
const cbb = tBot.m.callbackButton

class self{

    static #wd = null
    static #process = false
    static #waitNewNameForAnswer = false

    static async init(){
        self.#process = true
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth('Get Task Info')
        self.#process = false
        return self
    }

    static async build(id){
        log('\n---\nNew task - ' + id + ' | ' + new Date().toLocaleString('ru-RU'))
        if(!self.#wd && !self.#process) await self.init()
        if(self.#process) await new Promise(resolve => {  setInterval(()=>{ if(!self.#process) resolve() },100) })
        self.#process = true
        const d = self.#wd
        log('Task info getting - ' + id + ' ...')
        await d.open('https://youdo.com/t' + id)
        const info = {
            id,
            title: await (await d.cssLocated('.b-task-block__header__title')).getText(),
            text: await (await d.cssLocated('.b-task-block__description')).getText(),
            address: await (await d.cssLocated('.b-task-block__address > .b-task-block__info')).getText(),
            date: await (await d.cssLocated('.b-task-block__date__wrap')).getText(),
            price: await (await d.cssLocated('.b-task-block__budget > .b-task-block__info')).getText(),
            priceMethod: await (await d.cssLocated('.b-task-block__payment > .b-task-block__info')).getText(),
            place: await (await d.cssLocated('.b-task-block__location > .b-task-block__info')).getText(),
            name: await (await d.cssLocated('.b-task-block__userinfo__name')).getText(),
            authorLink: (await (await d.cssLocated('.b-task-block__userinfo__name')).getAttribute('href'))
        }
        log('Task info getting done! - ' + id + '\n---')
        self.#process = false
        return new self(id, info)
    }

    constructor(id, info){
        this.id = id
        this.info = info
    }

    async sendToTelegramBot(){
        this.tgMsgId = (await tBot.send(textNewTask(this.info), {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: tBot.m.inlineKeyboard([cbb('Предложить помощь', 'answer_'+this.id)])
        })).message_id

        tBot.action('answer_'+ this.id, ctx => {
            ctx.answerCbQuery('Тебя выберут, не сомневайся)')
            ctx.editMessageReplyMarkup(require('./kbs/kbName')(this.info))
            this.answer = {}
            this.prepareAnswer()
        })
    }

    async prepareAnswer(){
        const setName = function(name){
            this.answer.name = name
            this.answer.textTg = textNewTask(this.info) +
                '**************************\n' +
                'Задание №' + this.id + '\n\n' +
                'Имя в шаблоне: ' + (this.answer.name || 'без имени') +
                '\n--------------------------'

            tBot.edit(this.tgMsgId, this.answer.textTg, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: require('./kbs/kbTemplates')(this.id)
            })
        }.bind(this)

        tBot.action(new RegExp('^name_'+this.id+'_(\\d)$'), async ctx => {
            ctx.answerCbQuery()

            if(ctx.match[1] === '2') self.#waitNewNameForAnswer = (await ctx.reply('Как будем обращаться? (=Имя)')).message_id
            else setName(ctx.match[1] === '1' ? this.info.name.split(' ')[0] : '')
        })

        tBot.hears(/^=([а-яА-ЯёЁ]{2,15}\s?[а-яА-ЯёЁ]{0,15})$/, ctx => {
            if(self.#waitNewNameForAnswer){
                tBot.delete(self.#waitNewNameForAnswer)
                self.#waitNewNameForAnswer = false
                setName(ctx.match[1])
            }
            ctx.deleteMessage()
        })

        tBot.action(new RegExp('^template_'+this.id+'_(\\d\\d?)$'), ctx => {
            ctx.answerCbQuery()

            this.answer.templateName = ctx.match[1]
            this.answer.textTg += '\nШаблон: ' + data.answer.templateName[this.answer.templateName] +
                '\n--------------------------'

            ctx.editMessageText(this.answer.textTg, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: require('./kbs/kbTime')(this.id)
            })
        })

        tBot.action(new RegExp('^time_'+this.id+'_(\\d)(\\d)$'), ctx => {
            ctx.answerCbQuery()

            this.answer.time = [ctx.match[1], ctx.match[2]]
            this.answer.textTg += '\nВремя: ' + data.answer.time[this.answer.time[0]] +
                (ctx.match[2] === '1' ? ', сейчас свободен' : '') +
                '\n--------------------------'

            ctx.editMessageText(this.answer.textTg, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: require('./kbs/kbPrice')(this.id)
            })
        })

        tBot.action(new RegExp('^price_'+this.id+'_(\\d{4,5})$'), ctx => {
            ctx.answerCbQuery()

            this.answer.price = ctx.match[1]
            this.answer.textTg += '\nОплата: ' + this.answer.price +
                '\n**************************'

            ctx.editMessageText(this.answer.textTg, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: tBot.m.inlineKeyboard([
                    cbb('Подтвердить', 'access_' + this.id),
                    cbb('Отмена', 'cancel_' + this.id)
                ])
            })
        })


        tBot.action(new RegExp('^access_'+this.id+'$'), async ctx => {
            ctx.answerCbQuery()

            ctx.editMessageText(this.answer.textTg + '\n\n        Оставляю предложение...', {
                disable_web_page_preview: true,
                parse_mode: "HTML"
            })

            await new Promise(resolve => { setTimeout(resolve, 2000)})

            ctx.editMessageText(this.answer.textTg, {
                disable_web_page_preview: true,
                parse_mode: "HTML"
            })
        })

        tBot.action('cancel_'+this.id, ctx => {
            ctx.answerCbQuery()
            delete this.answer

            ctx.editMessageText(textNewTask(this.info), {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: tBot.m.inlineKeyboard([cbb('Предложить помощь', 'answer_'+this.id)])
            })

            self.#process = false
        })
    }
}

setTimeout(self.init, 1000)

module.exports = self
