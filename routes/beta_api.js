var async = require('async'),
    fs = require('fs'),
    colors = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment'); 
	
var app = require('../app').app,
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    notification_api = require('./notification_api'),
    permissionAPI = require('./permission_api'),	
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js'); 
 
var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");
	
app.get('/',permissionAPI.authUser,homePage);
app.get('/beta',betaHomePage);

function betaHomePage(req,res,next){

    var locals = {};	
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:10, option = {'skip':skip,'limit':limit};

	async.parallel([
	    function(callback) {
	       if (req.session.uid) {
		        userModel.findUserById(req.session.uid,function(err,user){
		            if(err) {
			            //console.log('user uid not found with server error'.red, err);
		            }else if(!user){
					    //console.log('user uid not found'.red, err);
					}
			        else{
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
			            //console.log('course uid not found'.red,err);
		            }
			        else{
			            //console.log('find courses'.green,courses.length);			   
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
		        userModel.findUserById(req.session.uid,function(err,user){
		            if(err) {
			            //console.log('user uid not found with server error'.red, err);
		            }else if(!user){
					    //console.log('user uid not found'.red, err);
					}
			        else{
			            //console.log('find user uid'.green,user._id);
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
		     courseModel.findCoursesAndTutorByQuery({},option,function(err,courses){
		            if(err) {
			            //console.log('findCoursesAndTutorByQuery error '.red,err);
		            }else if(!courses){console.log('course uid not found'.red);}
			        else{
                        //for(var i=0;i<courses.length;i++)
                        //console.log(courses[i]);						
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