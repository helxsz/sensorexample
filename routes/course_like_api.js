var app = require('../app').app;
var courseModel = require('../model/course_model');
var courseLikeModel = require('../model/course_like_model');
var	gridfs = require("./gridfs");

var async = require('async');
var fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");

var notification_api = require('./notification_api');

// Middleware  moderators  admin
var requireLogin = function(role) {
  return function(req, res, next) {
    if(req.session.uid){
		next();
	}else{
	    res.redirect('/login');
	}	
  }
};

/********************************************************************

       like/ not like the course

*********************************************************************/


app.post('/course/:id/like',requireLogin(''),postLikeOnCourse);
app.del('/course/:id/like',requireLogin(''),delLikeOnCourse);
function postLikeOnCourse(req,res,next){
     console.log(req.params.id,req.body.like);
	 
	 var like = sanitize(req.body.like).toInt(); 
	 console.log('like',like);
	 
	 try {
         check(like, 'Please enter a valid integer').notNull().isInt();
     } catch (e) {
         console.log(e.message); //Please enter a valid integer
     }
	 
	 if(like ==0){
	    courseLikeModel.like(req.params.id,req.session.uid,function(err,data){
	        if(err){console.log('like err');next(err)}
            else{
				console.log('like success'.green,data);
				res.send(200,{'like':1});
				courseModel.findCourseAndTutorById(req.params.id,function(err,data){				
				    console.log('findCourseAndTutorById'.green,data);
					notification_api.pushUserNotification(data.id._id,req.session.uid,'like','your <a href="/course/'+req.params.id+'">course</a>');
				})
			}				     
		})       
	 }
     else{ 
	    courseLikeModel.unlike(req.params.id,req.session.uid,function(err,data){
	        if(err){console.log('unlike err');next(err)}
            else{
				console.log('unlike success'.green,data);
				res.send(200,{'like':0});
			}				     
		})	    
	 }
}

function delLikeOnCourse(req,res,next){
     console.log(req.body.course_id,req.params.id);
     res.send(200);
}


//https://localhost/course/51781fc02a712a2808000003/like
app.get('/course/:id/like',getCourseLike);
function getCourseLike(req,res,next){
    courseLikeModel.getLikeList(req.params.id,function(err,data){
	    if(err){console.log('getLikeList err');next(err);}
        else{
			console.log('getLikeList success'.green,data);
			res.send(data);
		}	
	})	
}