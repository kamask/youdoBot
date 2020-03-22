const log = (...m) => console.log(...m)
const TBot = require('./KskTelegramBot')
const WD = require('./KskWebDriver')

class self {
    static wdGT = null
    static wdTA = null

    static async init(){
        self.wdGT = await new WD().building('chrome') // GT - Get Task

        self.wdTA = await new WD().building('chrome', true) // TA - Task Answer

        let auth, authTrying = 0
        do{
            log('Auth try - ' + (++authTrying))
            await self.wdGT.d.get('https://youdo.com')
            try{
                await self.wdGT.d.executeAsyncScript(async ()=>{
                    await fetch('/api/users/signin/', {
                        headers: {
                            "accept": "application/json",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        method: 'POST',
                        body: 'login='+arguments[0]+'&password='+arguments[1]
                    })
                    arguments[2]()
                }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
                await self.wdGT.d.get('https://youdo.com')
                auth = await self.wdGT.d.executeScript(()=> window.YouDo.Global.DynamicData.CurrentUserId)
            }catch(e){}
        }while(!auth)
        log('WebDriver: Task Watcher - auth!')
        if(TBot.auth) TBot.send('sendMessage', {text: 'Get tasks - auth!'})

        const cookies = await self.wdGT.d.manage().getCookies()
        await self.wdTA.d.get('https://youdo.com')
        for(let i of cookies) await self.wdTA.d.manage().addCookie(i)

        auth = false
        do{
            await self.wdTA.d.get('https://youdo.com')
            auth = await self.wdTA.d.executeScript(()=>window.YouDo.Global.DynamicData.CurrentUserId)
        }while (!auth)
        log('WebDriver: Task Answer - auth!')
        if(TBot.auth) TBot.send('sendMessage', {text: 'Task Answer - auth!'})
    }
}


module.exports = self