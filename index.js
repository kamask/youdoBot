/**
 *  Abbr:
 *      lt - last task
 */
global.storage = new Map()
const KskWD = require('./KskWebDriver')
const Task = require('./KskYoudoTask')
const tBot = require('./KskTeleBot')

KskWD.build('chrome').then(async wd => {

    await wd.youdoAuth('Main Window')

    await new Promise(resolve => {
        setInterval(()=>{
            if(storage.get('authCount') === 3) resolve()
        }, 300)
    })

    let currentLtId = null
    while(true){
        try{

            let ltLink = await wd.cssLocated('li.listItem___a431d:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)')
            let ltId = await ltLink.getAttribute('data-id')
            let ltText = await ltLink.getText()

            if(!currentLtId){
                currentLtId = ltId
                tBot.send('<a href="https://youdo.com/t'+ltId+'">'+ltText+'</a>', { disable_web_page_preview: true, parse_mode: 'HTML'})
                ;(await Task.build(ltId)).sendToTelegramBot()
            }

            let i = 3, newTasksId = []
            while(currentLtId < ltId){
                tBot.send('<a href="https://youdo.com/t'+ltId+'">'+ltText+'</a>', { disable_web_page_preview: true, parse_mode: 'HTML'})
                newTasksId.push(ltId)
                ltLink = await wd.cssLocated('li.listItem___a431d:nth-child(' + i++ + ') > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)')
                ltId = await ltLink.getAttribute('data-id')
                ltText = await ltLink.getText()
            }

            if(newTasksId.length > 0){
                currentLtId = newTasksId[0]
                do{
                    let tempId = newTasksId.shift()
                    ;(await Task.build(tempId)).sendToTelegramBot()
                }while(newTasksId.length > 0)
            }

            await wd.reload(500)

        }catch(e){
            console.error(e)
            break
        }

    }

})
