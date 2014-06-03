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
	
	
app.get('/lab/device',function(req,res,next){
    res.render('lab/device/app');
})