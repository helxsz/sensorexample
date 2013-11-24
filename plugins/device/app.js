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
	winston = require('../../utils/logging.js');;
	
	
app.get('/lab/device',function(req,res,next){
    //res.render('lab/device/app');	
	ejs.renderFile(__dirname + '/views/app.html',{}, function(err, result) {
        if (!err) {
            res.end(result);
        }
        else {
            res.end('An error occurred');
        }
    });
})


