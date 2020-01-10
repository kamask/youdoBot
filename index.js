/**
 *  Abbr:
 *      lt - last task
 */
global.storage = new Map()
const KskWD = require('./KskWebDriver')
const Task = require('./KskYoudoTask')

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

            if(!currentLtId){
                currentLtId = ltId
                const task = await Task.build(ltId)
                storage.set(ltId, task)
                task.sendToTelegramBot()
            }

            let i = 3, newTasksId = []
            while(currentLtId < ltId){
                newTasksId.push(ltId)
                ltLink = await wd.cssLocated('li.listItem___a431d:nth-child(' + i++ + ') > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)')
                ltId = await ltLink.getAttribute('data-id')
            }

            if(newTasksId.length > 0){
                currentLtId = newTasksId[0]
                do{
                    let tempId = newTasksId.shift()
                    const task = await Task.build(tempId)
                    storage.set(tempId, task)
                    task.sendToTelegramBot()
                }while(newTasksId.length > 0)
            }

            await wd.reload(500)

        }catch(e){
            console.error(e)
            break
        }

    }

})
