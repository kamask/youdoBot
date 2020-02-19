module.exports = id => {
    return {
        inline_keyboard: [
            [
                {text: '500', callback_data: 'price_'+id+'_500'},
                {text: '800', callback_data: 'price_'+id+'_800'},
                {text: '1000', callback_data: 'price_'+id+'_1000'},
                {text: '1200', callback_data: 'price_'+id+'_1200'},
                {text: '1500', callback_data: 'price_'+id+'_1500'},
                {text: '1800', callback_data: 'price_'+id+'_1800'}
            ],[
                {text: '400', callback_data: 'price_'+id+'_400'},
                {text: '2000', callback_data: 'price_'+id+'_2000'},
                {text: '2200', callback_data: 'price_'+id+'_2200'},
                {text: '2500', callback_data: 'price_'+id+'_2500'},
                {text: '2800', callback_data: 'price_'+id+'_2800'}
            ],[
                {text: '3000', callback_data: 'price_'+id+'_3000'},
                {text: '3500', callback_data: 'price_'+id+'_3500'},
                {text: '4000', callback_data: 'price_'+id+'_4000'},
                {text: '4500', callback_data: 'price_'+id+'_4500'},
                {text: '5000', callback_data: 'price_'+id+'_5000'},
                {text: '5500', callback_data: 'price_'+id+'_5500'}
            ],[
                {text: '6000', callback_data: 'price_'+id+'_6000'},
                {text: '6500', callback_data: 'price_'+id+'_6500'},
                {text: '7000', callback_data: 'price_'+id+'_7000'},
                {text: '8000', callback_data: 'price_'+id+'_8000'},
                {text: '9000', callback_data: 'price_'+id+'_9000'}
            ],[
                {text: '10000', callback_data: 'price_'+id+'_10000'},
                {text: '11000', callback_data: 'price_'+id+'_11000'},
                {text: '12000', callback_data: 'price_'+id+'_12000'},
                {text: '13000', callback_data: 'price_'+id+'_13000'},
                {text: '15000', callback_data: 'price_'+id+'_15000'}
            ],[
                {text: 'Отмена', callback_data: 'cancel_'+id}
            ]
        ]
    }
}