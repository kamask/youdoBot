function log(...p){console.log(...p)}
const {Builder, By, Key, until} = require('selenium-webdriver')

module.exports = class self{
    static key = Key

    static async build(browser){
        const wd = new self()

        wd.#driver = await new Builder().forBrowser(browser).build()
        wd.#driver.manage().window().minimize()

        wd.sleep = wd.#driver.sleep

        return wd
    }

    #driver

    async open(url){
        await this.#driver.get(url)
        return this
    }

    async cssLocated(css, time = undefined, reload = false){
        let located
        while (true){
            try{
                located = await this.#driver.wait(until.elementLocated(By.css(css)), time)
                break
            }catch (e) {
                if(reload){
                    await this.#driver.navigate().refresh()
                    continue
                }
                located = undefined
                break
            }
        }
        return located
    }

    async reload(t = 0){
        return new Promise(resolve => {
            setTimeout(async () => {
                await this.#driver.navigate().refresh()
                resolve(true)
            }, t)
        })
    }

    async youdoAuth(youdo,name){
        let loginButton, loginInput, passwordInput, uid, i = 1, secForWaitAuth = 1500

        await this.open('https://youdo.com/tasks-all-opened-all-1')

        do{
            loginButton = await this.cssLocated('a.link___d4089:nth-child(1)', 500, true)
            await loginButton.click()
            loginInput = await this.cssLocated('div.row:nth-child(1) > input:nth-child(1)')
            passwordInput = await this.cssLocated('div.row:nth-child(2) > input:nth-child(1)')
            await loginInput.sendKeys(youdo.login)
            await passwordInput.sendKeys(youdo.password, Key.RETURN)
            await this.reload(secForWaitAuth)
            uid = await this.cssLocated('.block___d4bb2', 500)

            if(uid) log(name + ' - auth')
            else{
                secForWaitAuth += 500
                log(name + ' - not auth, retry - ' + i++)
            }
        }while(!uid)

        return uid
    }
}