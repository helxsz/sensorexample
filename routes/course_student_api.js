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

// 
app.get('/profile/:username/student',permissionAPI.authUser,getStudentDashboardPage);
app.get('/profile/:username/tutor',permissionAPI.authUser,getTutorDashboardPage);
function getStudentDashboardPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Student Dashboard';
                         res.render('dashboard_student',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	   

}

function getTutorDashboardPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Tutor Dashboard';
                         res.render('dashboard_tutor',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	

}

// Test
app.get('/course/:id/test',getCourseTestPage);
app.get('/course/:id/test2',getCourseTestPage2);
app.get('/course/:id/test3',getCourseTestPage3);


function getCourseTestPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Test';
                         res.render('course_test',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	 
}


function getCourseTestPage2(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Test';
                         res.render('course_test2',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	 
}

function getCourseTestPage3(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            callback();		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Test';
                         res.render('course_test3',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	 
}


/************************************
            answer the question 
*************************************/
app.post('/workplan/:plan_id/milestone/:milestone_id/questions/:question_id',answerQuestions);
function answerQuestions(req,res,next){
   var plan_id = req.params.plan_id, milestone_id = req.params.milestone_id, question_id = req.params.question_id;
   console.log('answerQuestions',plan_id,milestone_id, question_id);
   studentPlanModel.addAnswerToQuestion(plan_id,milestone_id,question_id,['111','222','333'],function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.send(200,data);
		}   
   })
}