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


app.get('/course/:id/setting/milestone',getMilestonePage)
function getMilestonePage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            courseModel.getCourseSetting(req.params.id,function(err,data){
                if(err) {next(err);callback();}
	            else{
	               //console.log('getCourseSettingPage success'.green,data.title,data.city);
				   console.log(data);
		           locals.course = data;
				   callback();
	            }				
            })		    
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Setting';
						 locals.page = 'milestone';
                         res.render('course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	 
}
	
app.get('/course/:course_id/plan',getAllPlans);	
function getAllPlans(req,res,next){
   
   var course_id = req.params.course_id;
   console.log('get all plans of that course',course_id);
   studentPlanModel.getStudentPlans(course_id,function(err,plans){
       if(err) next(err);
       else {
		   console.log('',plans);
		   res.send(200,plans);
	   }
   })
}

	
app.post('/course/:course_id/plan/:student_id',createPlanForStudent);
app.get('/course/:course_id/plan/:student_id',getPlanForStudent);
app.del('/course/:course_id/plan/:student_id',deletePlanForStudent);

function createPlanForStudent(req,res,next){
   var course_id = req.params.course_id, student_id = req.params.student_id;
   console.log('createPlanForStudent',course_id,student_id);
   studentPlanModel.createStudentPlan(course_id,student_id,function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);
		   res.send(200,{'plan_id':plan._id, "meta": { "code": 200} });
		   /*
		   courseModel.addPlanToList(course_id, plan._id,function(err,data){
		       if(err) next(err);
		       else res.send(200,{'plan_id':plan._id, "meta": { "code": 200} });
		   })
		   */
		}
   })
}

function getPlanForStudent(req,res,next){
   var course_id = req.params.course_id, student_id = req.params.student_id;
   console.log('getPlanForStudent',course_id,student_id);
   studentPlanModel.getOneStudentPlan(course_id,student_id,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.send(200,data);
		}
   })
}

function deletePlanForStudent(req,res,next){
   var course_id = req.params.course_id, student_id = req.params.student_id;
   console.log('deletePlanForStudent',course_id,student_id);

}

app.post('/workplan/:plan_id/addMilestone',addMilestone);
app.post('/workplan/:plan_id/removeMilestone/:milestone',removeMilestone);
app.get('/workplan/:plan_id/milestones', getMilestones);
//app.del('/workplan/:plan_id/milestones/:milestone_num',getOneMilestone);
function addMilestone(req,res,next){
   var plan_id = req.params.plan_id;
   var goal = req.body.goal;
   var goals = [{'goal':'abc','goal':'efg'}];
   console.log('addMilestone',plan_id,goal);
   studentPlanModel.addMilestone(plan_id,goal,function(err,data){
        if(err) next(err);
        else{
		    console.log('addMilestone  api'.green,data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });	
		}     
   })
}

function removeMilestone(req,res,next){
   var plan_id = req.params.plan_id, milestone = req.params.milestone;
   console.log('getOneMilestone',plan_id, milestone);
   studentPlanModel.removeMilestone(plan_id,milestone,function(err,data){
        if(err) next(err);
        else{
		    console.log('removeMilestone  api'.green,data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}      
   }) 
}

function getMilestones(req,res,next){
   var plan_id = req.params.plan_id;
   console.log('getMilestones',plan_id);
   studentPlanModel.getMilestones(plan_id,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
		    res.send(200,data);
		}     
   })
}



app.post('/workplan/:plan_id/milestone/:milestone_id/addQuestions',addQuestionToMilestone);
app.get('/workplan/:plan_id/milestone/:milestone_id/questions',getQuestionsOfMilestone);
app.post('/workplan/:plan_id/milestone/:milestone_id/removeQuestions/:question_id',removeQuestionFromMilestone); 

function addQuestionToMilestone(req,res,next){
   var plan_id = req.params.plan_id, milestone_id = req.params.milestone_id;
   var question_body = req.body.questions;
   console.log('addQuestionToMilestone'.green,plan_id,milestone_id,question_body);
   var ques = question_body.split(',');
   studentPlanModel.addQuestionToMilestone(plan_id,milestone_id,ques,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}     
   })
}

function getQuestionsOfMilestone(req,res,next){
   var plan_id = req.params.plan_id, milestone_index = req.params.milestone_id;
   console.log('getQuestionsOfMilestone',plan_id,milestone_index);
   studentPlanModel.getQuestionsByNumber(plan_id,milestone_index,function(err,data){
        if(err) next(err);
        else{
		    console.log(data.plan,data.plan.length);
			console.log(data.plan[0].goal,data.plan[0].ques.length);
			for(var i=0;i<data.plan[0].ques.length;i++)
			console.log(data.plan[0].ques[i]);
			
		    res.send(200,{"meta":{'code':200},"data":data.plan[0] });
			//res.send(200,{"meta":{'code':404} });
		}    
   
   })
}

function removeQuestionFromMilestone(req,res,next){
   var plan_id = req.params.plan_id, milestone_id = req.params.milestone_id, question_id = req.params.question_id;
   console.log('getQuestionsOfMilestone',plan_id,milestone_id, question_id);
   studentPlanModel.removeQuestionFromMilestone(plan_id,milestone_id,question_id,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}     
   })
}




