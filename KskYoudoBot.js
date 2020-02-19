const log = (...m) => console.log(...m)
const TBot = require('./KskTelegramBot')
const WD = require('./KskWebDriver')

class self {
    static wdGT = null
    static wdTA = null

    static async init(){
        self.wdGT = await new WD().building('chrome') // GT - Get Task
        self.wdGT.d.get('https://youdo.com')

        self.wdTA = await new WD().building('chrome') // TA - Task Answer
        self.wdTA.d.get('https://youdo.com')

        let auth, authTrying = 0
        do{
            log('Auth try - ' + (++authTrying))
            await self.wdGT.d.get('https://youdo.com')
            await self.wdGT.d.executeAsyncScript(() => {
                fetch('/api/users/signin/', {
                    headers: {
                        "accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    method: 'POST',
                    body: 'login='+arguments[0]+'&password='+arguments[1]
                }).then((res)=>{
                    arguments[2](res)
                }).catch(e=>{
                    arguments[2](e)
                })
            }, process.env.YOUDO_LOGIN, process.env.YOUDO_PASS)
            await self.wdGT.reload(2000)
            await self.wdGT.d.sleep(2000)
            try{ auth = await self.wdGT.d.executeScript(()=>window.YouDo.GuardCheck.isAuth) }catch(e){}
        }while(!auth)
        log('WebDriver: Task Watcher - auth!')
        if(TBot.auth) TBot.send('sendMessage', {text: 'Get tasks - auth!'})

        const cookies = await self.wdGT.d.manage().getCookies()
        for(let i of cookies) await self.wdTA.d.manage().addCookie(i)

        auth = false
        do{
            await self.wdTA.d.get('https://youdo.com')
            await self.wdTA.d.sleep(2000)
            try{ auth = await self.wdTA.d.executeScript(()=>window.YouDo.GuardCheck.isAuth) }catch(e){}
        }while (!auth)
        log('WebDriver: Task Answer - auth!')
        if(TBot.auth) TBot.send('sendMessage', {text: 'Task Answer - auth!'})
    }
}


module.exports = self