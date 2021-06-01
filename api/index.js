var express = require('express');
var r = express.Router();

// load pre-trained model
const model = require('./sdk/model.js'); //predict
const cls_model = require('./sdk/cls_model.js'); //cls

// Bot Setting
const TelegramBot = require('node-telegram-bot-api');
const token = '1817108964:AAGGAi5_Fq4K1xQi9dRjfMN9WePU4p7RVVY'
const bot = new TelegramBot(token, {polling: true});

state = 0;
// Main Menu bots
bot.onText(/\/start/, (msg) => { 
    bot.sendMessage(
        msg.chat.id,
        `hello ${msg.chat.first_name}, welcome...\n
        click /predict`
    );
    state = 0;
});

// input requires I and V
bot.onText(/\/predict/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        'Masukan Nilai i|v , contoh 7|8'
    );
    state = 1;
});

bot.on('message', (msg) => {
    if(state == 1){
        s = msg.text.split("|");
        model.predict(
            [
                parseFloat(s[0]), //string to float
                parseFloat(s[1])
            ]
       ).then((jres1)=>{
            console.log(jres1);
            
            cls_model.classify([parseFloat(s[0]), parseFloat(s[1]), parseFloat(jres1[0]), parseFloat(jres1[1])]).then((jres2)=>{
                    bot.sendMessage(
                        msg.chat.id,
                        `Nilai V yang Di Prediksi adalah ${jres1[0]} Volt`
                        );
                    bot.sendMessage(
                        msg.chat.id,
                        `Nilai P yang Di Prediksi adalah ${jres1[1]} Watt`
                        );
                    bot.sendMessage(
                        msg.chat.id,
                        `Klasifikasi Tegangan adalah ${jres2}`
                        );
                    state = 0;
            })
        })
    }else{
        bot.sendMessage(
              msg.chat.id,
              `Please Click /start`
        );
        
        state = 0
    }
})

// routers
r.get('/predict/:i/:r', function(req, res, next) {    
    model.predict(
        [
            parseFloat(req.params.i), // string to float
            parseFloat(req.params.r)
        ]
    ).then((jres)=>{
        res.json(jres);
    })
});

// routers
r.get('/classify/:i/:r', function(req, res, next) {    
    model.predict(
        [
            parseFloat(req.params.i), // string to float
            parseFloat(req.params.r)
        ]
    ).then((jres)=>{
        cls_model.classify(
            [
                parseFloat(req.params.i), // string to float
                parseFloat(req.params.r),
                parseFloat(jres[0]), 
                parseFloat(jres[1])
            ]
         ).then((jres_)=>{
            res.json({jres, jres_})
        })
    })
});

module.exports = r;
