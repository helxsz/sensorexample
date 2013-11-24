var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
    async = require('async'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
	ejs = require('ejs');

var app = require('../../app').app,
    gridfs = require("../../utils/gridfs"),
	winston = require('../../utils/logging.js');
	
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 9000 }
    /*ssl: {
        key: fs.readFileSync('/path/to/your/ssl/key/here.key'),
        certificate: fs.readFileSync('/path/to/your/ssl/certificate/here.crt')
    }*/
);

	
app.get('/lab/voice',function(req,res,next){
    //res.render('lab/rtc/app');
	ejs.renderFile(__dirname + '/views/app.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });	
})	

app.get('/lab/chat',function(req,res,next){
    //res.render('lab/rtc/chat');  
	ejs.renderFile(__dirname + '/views/chat.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });	
})

app.get('/lab/videochat',function(req,res,next){
    //res.render('lab/rtc/videochat');  
	ejs.renderFile(__dirname + '/views/videochat.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });	
})

app.get('/lab/game',function(req,res,next){
    //res.render('lab/rtc/game'); 
	ejs.renderFile(__dirname + '/views/game.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });	
})


app.get('/lab/socketcamera',function(req,res,next){
    //res.render('lab/rtc/socketcamera');
	ejs.renderFile(__dirname + '/views/socketcamera.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });	
})

