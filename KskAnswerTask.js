function log(...p){console.log(...p)}
const KskWD = require('./KskWebDriver')
const tBot = require('./KskTeleBot')
const textNewTask = require('./tpl/telebot/newTask')

class self {
    static #wd = null
    static #process = false

    id
    info
    answerInfo

    static async init(){
        self.#process = true
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth('Answer Task')
        self.#process = false
        return self
    }

    static async build(id){
        log('\n---\nNew answer task build - ' + id + ' ...')

        if(!self.#wd && !self.#process) await self.init()
        if(self.#process) await new Promise(resolve => { setInterval(()=>{ if(!self.#process) resolve() },100) })
        const task = storage.get(id)

        tBot.editMarkup(task.telegramMessageId, require('./kbs/kbName')(task.info))
        tBot.action(new RegExp('^name_'+id+'_(\\d)$'), async ctx => {
            ctx.answerCbQuery()
            console.log(task.id)

        })

        log('Answer sending - ' + id + ' ...')
        self.#process = true
        const d = self.#wd
        await d.open('https://youdo.com/t' + id)



        log('Answer sending done! - ' + id + '\n---')
        self.#process = false
        return new self()
    }
}
setTimeout(self.init, 1500)
module.exports = self