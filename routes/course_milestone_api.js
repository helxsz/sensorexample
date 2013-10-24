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
var permissionAPI = require('./permission_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");

var courseModel = require('../model/course_model');	
var studentPlanModel = require('../model/student_plan_model');
var studentAnswerModel = require('../model/student_answer_model');
var questionModel = require('../model/question_model');

app.get('/course/:id/setting/milestone',permissionAPI.authUser, permissionAPI.authTutorInCourse,getMilestonePage)
function getMilestonePage(req,res,next){
    var locals = {};
    var id = req.params.id;
	
	async.parallel([
		function(callback) {
            courseModel.findCourseById2(req.params.id,'_id',function(err,data){
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
                         res.render('course/course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals.course);
                    }
                  });
	    });	 
}


/***************************************************************
     default course plan for the tutor 
***************************************************************/
app.get('/course/:id/tutor/plan',permissionAPI.authUser, permissionAPI.authTutorInCourse,getCoursePlanOfTutor);
function getCoursePlanOfTutor(req, res, next){
    var course_id = req.params.id;
	var uid = req.session.uid;
    console.log('get course plans default',course_id, uid);
    studentPlanModel.getOneStudentPlan(course_id,uid,function(err,data){
        if(err) next(err);
		else if(!data) { 
		     console.log('getCoursePlanOfTutor not found'.red);
             studentPlanModel.createPlanAndAddMilestone(course_id,uid,[],function(err,data1){
			    if(err) next(err);
				else if (!data1) res.send(404);
			    else res.send(data);
			 })			 			 
		} 
        else{
		    console.log('getCoursePlanOfTutor'.green, data);
			res.send(200,data); 		    
		}
    })	
}
app.post('/course/:id/tutor/plan',permissionAPI.authUser, permissionAPI.authTutorInCourse,createTutorPlans);
function createTutorPlans(req,res,next){
   var course_id = req.params.id;
   var uid = req.session.uid;
   var goalText = req.body.goals;
   // should check goals are array
   var goals = goalText.split(',');
   console.log('createTutorPlans','cid:',course_id, 'uid',uid, 'goal',goals.length);    
   studentPlanModel.createPlanAndAddMilestone(course_id,uid,goals,function(err,plan){
        if(err) next(err);
		else if(!plan)  { console.log('create tutor plan failed'.red);  res.send(404);} 
        else {
		   console.log('',plan);
		   res.send(201,{'plan_id':plan._id, "meta": { "code": 201} });		   
		}
   })
}
/****************************************************************

        assign the plan to the student

*****************************************************************/
// for tutor to use	
app.post('/course/:id/plan/:student_id',permissionAPI.authUser, permissionAPI.authTutorInCourse,assignPlanToStudent);
app.get('/course/:id/plan/:student_id,',permissionAPI.authUser, permissionAPI.authTutorInCourse,getStudentPlanForTutor);

// for the tutor
app.del('/course/:id/plan',permissionAPI.authUser, deletePlanForStudent);

// should have a plan id
function assignPlanToStudent(req,res,next){
   var course_id = req.params.id, student_id = req.params.student_id;
   var uid = req.session.uid;
   console.log('assignPlanToStudent','cid:',course_id,'uid',student_id);
    var locals = {};
	async.parallel([
		function(callback) {
		    /////////////////////////////////////////////////////////////
			studentPlanModel.getMilestones2(course_id, uid ,function(err,data1){
				console.log('getPlanForStudent  getMilestones'.green, data1);
				if(err) return res.send(404,{error:err});
				else if(!data1) return res.send(404);
				else{
				    locals.plan = data1.plan;
					//console.log('data',data1);
				    callback();
				}
			})				                       		    
		}],function(err) {
	        if (err) return next(err); 
			var data = new Object();
			data.plan = locals.plan;
			//data.plan.push({'goal':'aa11'});
			studentPlanModel.copyPlan(course_id,student_id,data,function(err,data){
                if(err) {console.log('error in assigning the plan to students'.red, err);return res.send(404,{error:err}); }
				else if(data==0) {console.log('cant update assigning the plan'.red);return res.send(404); }
                else { console.log('  assigning the plan'.green); res.send(200,{data:null});  }
            })
	});	   
}

function getStudentPlanForTutor(req,res,next){
   var student_id = req.params.student_id, cid = req.params.id;
   console.log('getPlanForStudent'.green,'cid:',cid,'student_id',student_id);
   if(student_id == null || cid == null)
   return res.send(400,{'meta':400,"status":"error"});

   studentPlanModel.getOneStudentPlan(cid,student_id,function(err,data){
        if(err) next(err);
        else{
		    console.log('getPlanOfEachStudent'.green, data);
			res.send(200,data); 
			if(data == null){
			    res.send(404,data);							
			}	    
		}
   })
}



function deletePlanForStudent(req,res,next){
   var uid = req.session.uid, cid = req.params.id;
   console.log('deletePlanForStudent',cid,uid);
   if(uid == null || question_id ==null || cid == null)
   return res.send(400,{'meta':400,"status":"error"});
   else if(answer == null || debug == null)
   return res.send(400,{'meta':400,"status":"error"});
}

/********************************************************

           build the plan

*********************************************************/
app.post('/course/:id/milestone/tutor',addTutorMilestone);
app.delete('/course/:id/milestone/tutor',removeTutorMilestone);
app.get('/course/:id/milestone/tutor',getTutorMilestones);
function addTutorMilestone(req,res,next){
   var cid = req.params.id;
   var goal = req.body.goal;
   var uid = req.session.uid;
   //var goals = [{'goal':'abc','goal':'efg'}];
   console.log('addMilestone',cid,goal);
   studentPlanModel.addMilestone2(cid,uid,goal,function(err,data){
        if(err) next(err);
        else{
		    console.log('addMilestone  api'.green,data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });	
		}     
   })
}

function removeTutorMilestone(req,res,next){
   var cid = req.params.id, milestone = req.params.milestone;
   var uid = req.session.uid;
   console.log('getOneMilestone',cid, milestone);
   studentPlanModel.removeMilestone2(cid,uid,milestone,function(err,data){
        if(err) next(err);
        else{
		    console.log('removeMilestone  api'.green,data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}      
   })
}

function getTutorMilestones(req,res,next){
   var cid = req.params.id;    var uid = req.session.uid;
   console.log('getMilestones',cid,uid);
   studentPlanModel.getMilestones2(cid,uid,function(err,data){
        if(err) next(err);
        else{
		    console.log('getMilestones'.green,data);
			console.log(data.plan[0].goal, data.plan[0].ques.length);
			for(var i=0;i<data.plan[0].ques.length;i++)
			console.log(data.plan[0].ques[i]);
		    res.send(200,data);
		}     
   })
}



app.post('/course/:id/milestone/:milestone_id/addQuestions',addQuestionToMilestone2);
app.get('/course/:id/milestone/:milestone_id/questions',getQuestionsOfMilestone2);
app.delete('/course/:id/milestone/:milestone_id/removeQuestions/:question_id',removeQuestionFromMilestone2); 

function addQuestionToMilestone2(req,res,next){
   var cid = req.params.id, milestone_id = req.params.milestone_id;
    var uid = req.session.uid;
   var question_body = req.body.questions;
   console.log('addQuestionToMilestone'.green,cid,milestone_id,question_body);
   var ques = question_body.split(',');
   studentPlanModel.addQuestionToMilestone2(cid,uid, milestone_id,ques,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}     
   })
}

function getQuestionsOfMilestone2(req,res,next){
   var cid = req.params.id, milestone_index = req.params.milestone_id;
    var uid = req.session.uid;
   console.log('getQuestionsOfMilestone',cid,milestone_index);
   studentPlanModel.getQuestionsByNumber2(cid,uid, milestone_index,function(err,data){
        if(err) next(err);
        else{
		    console.log(data.plan[0],data.plan.length,data.plan[0].goal);
			/*
			console.log(data.plan[0].goal,data.plan[0].ques.length);
			for(var i=0;i<data.plan[0].ques.length;i++)
			console.log(data.plan[0].ques[i]);
			*/
		    res.send(200,{"meta":{'code':200},"data":data.plan[0] });
			//res.send(200,{"meta":{'code':404} });
		}    
   
   })
}

function removeQuestionFromMilestone2(req,res,next){
   var id = req.params.id, milestone_id = req.params.milestone_id, question_id = req.params.question_id;
    var uid = req.session.uid;
   console.log('getQuestionsOfMilestone',id,milestone_id, question_id);
   studentPlanModel.removeQuestionFromMilestone2(id,uid, milestone_id,question_id,function(err,data){
        if(err) next(err);
        else{
		    console.log(data);
			if(data == 1)   res.send(200,  {"meta":{'code':200} });		   
			else res.send(200,{"meta":{'code':404} });
		}     
   })
}




/*
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
		    console.log('getMilestones'.green,data);
			console.log(data.plan[0].goal, data.plan[0].ques.length);
			for(var i=0;i<data.plan[0].ques.length;i++)
			console.log(data.plan[0].ques[i]);
		    res.send(200,data);
		}     
   })
}
*/
 

/*
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
		    console.log(data.plan[0],data.plan.length,data.plan[0].goal);

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
*/