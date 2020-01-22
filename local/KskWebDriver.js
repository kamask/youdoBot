const {Builder, By, Key, until, WebDriver} = require('selenium-webdriver')

class self{

    static key = Key
    static until = until
    static by = By
    static WD = WebDriver

    async building(browser){
        try{
            this.d = await new Builder().forBrowser(browser).build()
            return this
        }catch(e){
            console.error(e)
            return false
        }
    }

    async open(url){
        try{
            await this.d.get(url)
            return this
        }catch(e){
            console.error(e)
            return false
        }
    }

    async findSelector(css, time = undefined, reload = false, countRefresh = null){
        let located
        while (true){
            try{
                located = await this.d.wait(until.elementLocated(By.css(css)), time)
                break
            }catch (e) {
                if(reload && countRefresh !== 0){
                    await this.d.navigate().refresh()
                    countRefresh--
                    continue
                }
                located = undefined
                break
            }
        }
        return located
    }

    reload(t = 0){
        return new Promise(resolve => {
            setTimeout(async () => {
                await this.d.navigate().refresh()
                resolve(true)
            }, t)
        })
    }
}

module.exports = self