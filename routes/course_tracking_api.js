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

var permissionAPI = require('./permission_api');


app.get('/course/:id/tracking',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage);
app.get('/course/:id/tracking2',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage2);
app.get('/course/:id/planAllocation',permissionAPI.authUser, permissionAPI.authTutorInCourse,getPlanAllocation);
app.get('/course/:id/planAllocation2',permissionAPI.authUser, permissionAPI.authTutorInCourse,getPlanAllocation2);
app.get('/course/:id/planAllocation3',  permissionAPI.authUser, permissionAPI.authTutorInCourse,getPlanAllocation3);
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

function getCourseTrackingPage2(req,res,next){
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
                         res.render('course_tracking2',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});	    
}



function getPlanAllocation(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Allocation';
                         res.render('course_plan_allocation',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});
}

function getPlanAllocation2(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Allocation';
                         res.render('course_plan_allocation2',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});
}

function getPlanAllocation3(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Allocation';
                         res.render('course_plan_allocation3',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});
}
