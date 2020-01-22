const Markup = require('telegraf/markup')
const cbb = Markup.callbackButton

module.exports = id => {
    return Markup.inlineKeyboard([
        [
            cbb('500', 'price_'+id+'_500'),
            cbb('800', 'price_'+id+'_800'),
            cbb('1000', 'price_'+id+'_1000'),
            cbb('1200', 'price_'+id+'_1200'),
            cbb('1500', 'price_'+id+'_1500'),
            cbb('1800', 'price_'+id+'_1800')
        ],[
            cbb('400', 'price_'+id+'_400'),
            cbb('2000', 'price_'+id+'_2000'),
            cbb('2200', 'price_'+id+'_2200'),
            cbb('2500', 'price_'+id+'_2500'),
            cbb('2800', 'price_'+id+'_2800')
        ],[
            cbb('3000', 'price_'+id+'_3000'),
            cbb('3500', 'price_'+id+'_3500'),
            cbb('4000', 'price_'+id+'_4000'),
            cbb('4500', 'price_'+id+'_4500'),
            cbb('5000', 'price_'+id+'_5000'),
            cbb('5500', 'price_'+id+'_5500')
        ],[
            cbb('6000', 'price_'+id+'_6000'),
            cbb('6500', 'price_'+id+'_6500'),
            cbb('7000', 'price_'+id+'_7000'),
            cbb('8000', 'price_'+id+'_8000'),
            cbb('9000', 'price_'+id+'_9000')
        ],[
            cbb('10000', 'price_'+id+'_10000'),
            cbb('11000', 'price_'+id+'_11000'),
            cbb('12000', 'price_'+id+'_12000'),
            cbb('13000', 'price_'+id+'_13000'),
            cbb('15000', 'price_'+id+'_15000')
        ],[cbb('Отмена', 'cancel_'+id)]
    ])
}