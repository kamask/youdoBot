function log(...p){console.log(...p)}
const KskWD = require('./KskWebDriver')
const tBot = require('./KskTeleBot')

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
        if(self.#process){
            await new Promise(resolve => {
                setInterval(()=>{
                    if(!self.#process){
                        self.#process = true
                        resolve()
                    }
                },100)
            })
        }
        const d = self.#wd
        const task = storage.get(id)
        log(task.info.title)
        log('Answer sending - ' + id + ' ...')
        await d.open('https://youdo.com/t' + id)
        log('Task info getting done! - ' + id + '\n---')
        return new self()
    }
}
setTimeout(self.init, 1500)
module.exports = self