module.exports = task => {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton('1000', 'price_'+task+'_1000'),
            Markup.callbackButton('1200', 'price_'+task+'_1200'),
            Markup.callbackButton('1500', 'price_'+task+'_1500'),
            Markup.callbackButton('1800', 'price_'+task+'_1800')
        ],[
            Markup.callbackButton('2000', 'price_'+task+'_2000'),
            Markup.callbackButton('2200', 'price_'+task+'_2200'),
            Markup.callbackButton('2500', 'price_'+task+'_2500'),
            Markup.callbackButton('2800', 'price_'+task+'_2800')
        ],[
            Markup.callbackButton('3000', 'price_'+task+'_3000'),
            Markup.callbackButton('3500', 'price_'+task+'_3500'),
            Markup.callbackButton('4000', 'price_'+task+'_4000'),
            Markup.callbackButton('4500', 'price_'+task+'_4500'),
            Markup.callbackButton('5000', 'price_'+task+'_5000'),
            Markup.callbackButton('5500', 'price_'+task+'_5500')
        ],[
            Markup.callbackButton('6000', 'price_'+task+'_6000'),
            Markup.callbackButton('6500', 'price_'+task+'_6500'),
            Markup.callbackButton('7000', 'price_'+task+'_7000'),
            Markup.callbackButton('8000', 'price_'+task+'_8000'),
            Markup.callbackButton('9000', 'price_'+task+'_9000')
        ],[
            Markup.callbackButton('10000', 'price_'+task+'_10000'),
            Markup.callbackButton('11000', 'price_'+task+'_11000'),
            Markup.callbackButton('12000', 'price_'+task+'_12000'),
            Markup.callbackButton('13000', 'price_'+task+'_13000'),
            Markup.callbackButton('15000', 'price_'+task+'_15000')
        ],[Markup.callbackButton('Отмена', 'cancel_'+task)]
    ])
}