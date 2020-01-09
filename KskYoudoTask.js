function log(...p){console.log(...p)}
const {youdo} = require('./config')
const KskWD = require('./KskWebDriver')


module.exports = class self{
    static #wd = null

    id

    static async init(){
        self.#wd = await KskWD.build('chrome')
        await self.#wd.youdoAuth(youdo, 'Get Task')
        return self.#wd
    }

    static async build(id){
        if(!self.#wd) await self.init()
        return new self(id)
    }

    constructor(id){
        this.id = id
    }

    sendToTelegramBot(t){
        t.send(this.id)
    }
}