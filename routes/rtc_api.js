var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
    async = require('async'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto');
	

var app = require('../app').app,
    gridfs = require("./gridfs");
	
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 9000 }
    /*ssl: {
        key: fs.readFileSync('/path/to/your/ssl/key/here.key'),
        certificate: fs.readFileSync('/path/to/your/ssl/certificate/here.crt')
    }*/
);

	
app.get('/lab/voice',function(req,res,next){
    res.render('lab/rtc/app');   
})	

app.get('/lab/chat',function(req,res,next){
    res.render('lab/rtc/chat');   
})

app.get('/lab/videochat',function(req,res,next){
    res.render('lab/rtc/videochat');   
})

app.get('/lab/game',function(req,res,next){
    res.render('lab/rtc/game');   
})


app.get('/lab/socketcamera',function(req,res,next){
    res.render('lab/rtc/socketcamera');
})