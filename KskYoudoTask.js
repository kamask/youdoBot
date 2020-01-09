function log(...p){console.log(...p)}
const {youdo} = require('./config')
const KskWD = require('./KskWebDriver')

class self{
    static #wd = null
    static #process = false

    id
    info

    static async init(){
        self.#process = true
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth(youdo, 'Get Task Info')
        self.#process = false
        return self
    }

    static async build(id){
        log('\n---\nNew task - ' + id)
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
        log('Task info getting - ' + id + ' ...')
        await d.open('https://youdo.com/t' + id)
        const info = {
            title: await (await d.cssLocated('.b-task-block__header__title')).getText(),
            text: await (await d.cssLocated('.b-task-block__description')).getText(),
            address: await (await d.cssLocated('.b-task-block__address > .b-task-block__info')).getText(),
            date: await (await d.cssLocated('.b-task-block__date__wrap')).getText(),
            price: await (await d.cssLocated('.b-task-block__budget > .b-task-block__info')).getText(),
            priceMethod: await (await d.cssLocated('.b-task-block__payment > .b-task-block__info')).getText(),
            place: await (await d.cssLocated('.b-task-block__location > .b-task-block__info')).getText(),
            name: await (await d.cssLocated('.b-task-block__userinfo__name')).getText(),
            authorId: (await (await d.cssLocated('.b-task-block__userinfo__name')).getAttribute('href')).substr(2)
        }
        log('Task info getting done! - ' + id + '\n---')
        return new self(id, info)
    }

    constructor(id, info){
        this.id = id
        this.info = info
    }

    sendToTelegramBot(t){
        t.send(this.info.title)
    }
}

self.init()

module.exports = self
