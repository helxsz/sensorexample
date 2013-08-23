var app = require('../app').app;
var	gridfs = require("./gridfs");

var async = require('async');
var fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');
var permissionAPI = require('./permission_api');


var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");

var courseModel = require('../model/course_model');
var userModel = require('../model/user_model');
	
var notification_api = require('./notification_api');	
var errors = require('../utils/errors');	

app.get('/',homePage);

app.get('/beta',betaHomePage);

function betaHomePage(req,res,next){

    var locals = {};	
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:10, option = {'skip':skip,'limit':limit};

	async.parallel([
	    function(callback) {
	       if (req.session.uid) {
		        console.log('retrieve homePage'.green, req.session.username,req.session.uid);
		        userModel.findUserById(req.session.uid,function(err,user){
		            if(err) {
			            console.log('user uid not found with server error'.red, err);
		            }else if(!user){
					    console.log('user uid not found'.red, err);
					}
			        else{
			            console.log('find user uid'.green,user._id);
                        locals.user = {
                           username: user.username,
					       email: user.email,
						   img: user.img
                        };					
                    }
                    callback();					
		        })
	        }else{
                    callback();	
            }			
		},
		function(callback) {
		   courseModel.findCoursesByQuery({},option,function(err,courses){
		            if(err) {
			            console.log('course uid not found'.red,err);
		            }
			        else{
			            console.log('find courses'.green,courses.length);			   
                        locals.courses = courses; 
                    }
				    callback();	
		   })
		  		
		}],function(err) {
	      if (err) {
		    console.log(err);
		    next(err);
			return;
          }				   
		  res.render('home', locals);
	});	
	
}

function homePage(req,res){
    var locals = {};	
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:10, option = {'skip':skip,'limit':limit};

	async.parallel([
	    function(callback) {
	       if (req.session.uid) {
		        console.log('retrieve homePage'.green, req.session.username,req.session.uid);
		        userModel.findUserById(req.session.uid,function(err,user){
		            if(err) {
			            console.log('user uid not found with server error'.red, err);
		            }else if(!user){
					    console.log('user uid not found'.red, err);
					}
			        else{
			            console.log('find user uid'.green,user._id);
                        locals.user = {
                           username: user.username,
					       email: user.email,
						   img: user.img
                        };					
                    }
                    callback();					
		        })
	        }else{
                    callback();	
            }			
		},
		function(callback) {
		   courseModel.findCoursesByQuery({},option,function(err,courses){
		            if(err) {
			            console.log('course uid not found'.red,err);
		            }
			        else{
			            console.log('find courses'.green,courses.length);			   
                        locals.courses = courses; 
                    }
				    callback();	
		   })
		  		
		}],function(err) {
	      if (err) {
		    console.log(err);
		    next(err);
			return;
          }				   
		  res.render('home', locals);
	});	 
	
}