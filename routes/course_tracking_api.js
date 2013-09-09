var app = require('../app').app;
var courseModel = require('../model/course_model');
var userModel = require('../model/user_model');
var questionModel = require('../model/question_model');
var	gridfs = require("./gridfs");

var async = require('async');
var fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');
var account_api = require('./account_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");

var courseModel = require('../model/course_model');	
var studentPlanModel = require('../model/student_plan_model');

app.get('/course/:id/tracking',getCourseTrackingPage);

function getCourseTrackingPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Tracking';
                         res.render('course_tracking',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});	    
}
