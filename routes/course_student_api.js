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

var notifyAPI = require('./notification_api');

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
app.get('/course/:id/test' , permissionAPI.authUser, getCourseTestPage);
app.get('/course/:id/test2', permissionAPI.authUser, getCourseTestPage2);
app.get('/course/:id/test3',  permissionAPI.authUser, permissionAPI.authStudentInCourse,  getCourseTestPage3);


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
	var uid = req.session.uid;
	async.parallel([
		function(callback) {
		 // first check user login 
		    userModel.findUserById(uid,function(err,user){
		       if(err || !user) {
			       console.log('user uid not found'.red);
                    return res.json(404);
		       }
			   else{
			        console.log('find user uid'.green,user._id);
                    locals.user = {
                       username : user.username, 
					   email : user.email,
					   img:user.img
                    };
					callback();
                }			
		    })		            	    
		},
		function(callback) {
		 //  then check user is in the course list
		    
		    callback();        	    
		}		
		],function(err) {
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
		    res.json(200,data);
		}   
   })
}

var answerModel = require('../model/student_answer_model');
app.post('/course/:courseid/answers/:question_id',answerSimpleQuestion);
function answerSimpleQuestion(req,res,next){
    var question_id = req.params.question_id, answer = req.body.answer, debug = req.body.debug;

	var uid = req.session.uid, cid = req.params.courseid;
	if(uid == null || question_id ==null || cid == null)
    return res.send(400,{'meta':400,"status":"error"});
	else if(answer == null || debug == null)
	return res.send(400,{'meta':400,"status":"error"});
	
	if(answer)   {   answer = sanitize(answer).trim(), answer = sanitize(answer).xss();  }
	if(debug)    {   debug = sanitize(debug).trim(), debug = sanitize(debug).xss();  }
	
	var notify = req.query.notify;
	var queArray = req.body.extra;
	console.log(notify+"  "+queArray);
	
	if(notify==1 && queArray.length > 0 ){
	    var tutorID;
	    async.series([
            function(callback) {	        
	             courseModel.findCourseById2(cid,'tutor',function(err,data){
				    if(err) console.log('error ',err);
				    else {
					    console.log('tutor is '.green,data.tutor.id);
						tutorID = data.tutor.id;
					}
					callback();
				 })        		
		    },	
		    function(callback) {
	             if(tutorID)  notifyAPI.notifyTutorOnMilestone(tutorID,uid, JSON.parse(queArray));	        		
                 callback();		    
		    }
		],function(err) {			
	    });	
	}
    answerModel.addAnswerResultToQuestion(uid,question_id, answer, debug, function(err, data){
            if(err) next(err);
		    else if(data==null || data ==0){
		       console.log("good not so well answer ".green,data);
		       res.json(204,data);
		    }
            else{
		        console.log("good submit answer this is good ".green,data);
		        res.json(200,{'meta':200,'data':null});
		    }			
	})
			
}

app.get('/course/:courseid/answers/:question_id',getAnswerOnQuestion);
function getAnswerOnQuestion(req,res,next){
    var question_id = req.params.question_id;
		
	var uid = req.session.uid, cid = req.params.courseid;
	if(uid == null || question_id ==null || cid == null)
    return res.json(400,{'meta':400,"status":"error"});
    answerModel.getAnswerResultsOnQuestion(uid,question_id,function(err, data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.json(200,data);
		}			
	})
}

app.delete('course/:courseid/answers/:question_id/:index',removeAnswerResultByIndex);
function removeAnswerResultByIndex(req, res, next){
    var question_id = req.params.question_id;
	var uid = req.session.uid, cid = req.params.courseid;
	var index = req.params.index;
	index = Number(index);
	console.log("removeAnswerResultByIndex ",uid, question_id, index);
	if(uid == null || question_id ==null || cid == null)
    return res.json(400,{'meta':400,"status":"error"});
    answerModel.removeAnswerResultByIndex(uid,question_id,index,function(err, data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.json(200,data);
		}			
	})
}


/*
app.delete('/answers/:question_id',removeAnswerResultToQuestion);
function removeAnswerResultToQuestion(req, res, next){
    var question_id = req.params.question_id;
	var uid = req.session.uid;
	if(uid == null || question_id ==null)
    res.send(400,{'meta':400,"status":"error"});
    answerModel.removeAnswerResultToQuestion(uid,question_id,function(err, data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.send(200,data);
		}			
	})
}
*/