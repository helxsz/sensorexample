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
var studentAnswerModel = require('../model/student_answer_model');
var permissionAPI = require('./permission_api');

var notifyAPI = require('./notification_api');

// 
app.get('/profile/:username/student',permissionAPI.authUser,getStudentDashboardPage);

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



// Test
app.get('/course/:id/test' , permissionAPI.authUser, getCourseTestPage);
app.get('/course/:id/test2', permissionAPI.authUser, getCourseTestPage2);
app.get('/course/:id/test3',  permissionAPI.authUser, permissionAPI.authStudentInCourse,  getCourseTestPage3);
app.get('/course/:id/test4', permissionAPI.authUser, getCourseTestPage4);

function getCourseTestPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	var uid = req.session.uid;
	
	async.parallel([
		function(callback) {
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

function getCourseTestPage4(req,res,next){
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
                         res.render('course_test5',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});	 
}

/***********************************************************

**************************************************************/
// for the student
app.get('/course/:id/plan',permissionAPI.authUser, getPlanForStudent);
function getPlanForStudent(req,res,next){
    var uid = req.session.uid, cid = req.params.id;
    console.log('getPlanForStudent'.green,'cid:',cid,'uid',uid);
    if(uid == null || cid == null)
    return res.send(400,{'meta':400,"status":"error"});
    var locals = {};
	
    async.series([
		function(callback) {
            studentPlanModel.getOneStudentPlan(cid,uid,function(err,data){
                if(err) {
				    if(xhr) return res.send(500,{'error':err});
				    return next(err);
			    }
                else{
		            //console.log('getPlanForStudent2'.green, data.plan, data.count);
			        for(var i=0;i<data.plan.length;i++){
			            //console.log(data.plan[i].goal,data.plan[i].ques.length,data.plan[i].ques,data.plan[i]);
			        }
			        var milestone_index = data.count.m_now, total_milestone = data.count.m_all;
			        locals.plan = data.plan[milestone_index];
			        locals.milestone_num = total_milestone;
			        locals.milestone_index = milestone_index;
                    callback();					
		        }
            })				                       		    
		},
		function(callback) {
            questionModel.findQuestionsInGroup(locals.plan.ques,'que tip','',function(err,data){                   		
                if(err) {
				    if(xhr) return res.send(500,{'error':err});
				    return next(err);
			    }
                else{
		            console.log('findQuestionsInGroup'.green, data);
					locals.plan.ques = data;
                    callback();					
		        }
            })				                       		    
		}		
		],function(err) {
	        if (err) return next(err); 
            else{
			    studentAnswerModel.getAnswersInGroup(uid, locals.plan.ques, 'anw debug verified right qid',function(err,data){
                    if(err) {
				         if(xhr) return res.send(500,{'error':err});
				         return next(err);
			        }
					locals.answers = data;
                    //console.log('getAnswersInGroup'.green,data);					
			        if(data == null){
                        res.send(404);				
			        }
                    else res.send(200,locals); 					
				})
			}
	});
}



app.post('/course/:id/join', permissionAPI.authUser, joinCourse);
app.post('/course/:id/disjoin', permissionAPI.authUser, disJoinCourse);

function joinCourse(req,res,next){
   console.log('joinCourse',req.params.id);  

   var course_id = req.params.id, uid = req.session.uid;
   
   var locals = {};
   
   courseModel.findCourseById2(course_id,'tutor',function(err,data){
        if(err) console.log('could not find the tutur'.red);
        else {
		    console.log('find the tutor  ',data, data.tutor.id);
			var tutor_id = data.tutor.id;
			studentPlanModel.getMilestonesByCourseAndTutor(course_id,tutor_id,function(err,data1){
				console.log('getMilestonesByCourseAndTutor  '.green, data1);
				if(err) console.log(err);
				else if(!data1) console.log('no milestones'.red);
				else{
			        var myplan = new Object();
			        myplan.plan = data1.plan;
					myplan.count = data1.count;
				    console.log(myplan);
			        studentPlanModel.copyPlan(course_id,uid,myplan,function(err,data){
                        if(err) {console.log('error in assigning the plan to students'.red, err); }
				        else if(data==0) {console.log('cant update assigning the plan'.red); }
                        else { console.log('  assigning the plan to the student'.green);   }
                    })					
				}				
			})			
		}
   })
   
   notifyAPI.publishMsg('course/'+course_id+'/user/'+uid+'/join',{},function(err,data){});
   

   courseModel.joinCourse(course_id,uid,function(err,course){
		if(err) {
            if(req.xhr) return res.send({"error":err}, 500);	
		    next(err);
		}else if(!course || course ==0){
			if(req.xhr) return res.send({"data":null},406);
			res.redirect("/course/"+req.params.id);		
		}else{
			console.log('join courses successfully'.green,course);
			if(req.xhr) {
                console.log('req.xhr  ',req.xhr);			
			    return res.send({"data":null}, 200);
			}else
			res.redirect("/course/"+req.params.id);
        }    
   })
/*  
   var mongoose = require('../app').mongoose;
   courseModel.findCourseById(req.params.id,function(err,course){
        if(err) next(err);       
		else{
		   course.stud.push({'_id': mongoose.Types.ObjectId(req.session.uid)});
           course.save(function (err) {
               if (err) next(err); 
			   res.redirect("/course/"+req.params.id);
           });
        }
   })
 */   
}

function disJoinCourse(req,res,next){
   console.log('disJoinCourse',req.params.id,req.session.uid);   
   var locals = {};
   
   notifyAPI.publishMsg('course/'+course_id+'/user/'+uid+'/join',{},function(err,data){});
   
   courseModel.disJoinCourse(req.params.id,req.session.uid,function(err,course){
		if(err) {
            if(req.xhr) return res.send({"error":err}, 500);		    
		    next(err);
		}else if(!course || course ==0){
			if(req.xhr) return res.send({"data":null}, 406);
			res.redirect("/course/"+req.params.id);		
		}else{
			console.log('disjoin courses succesfully'.green,course);
			if(req.xhr) {
                console.log('send ajax sucess to user');			
			    return res.send({"data":null} ,200);
			}
			res.redirect("/course/"+req.params.id);
        }    
   })
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
	             if(tutorID)  {
				        notifyAPI.notifyTutorOnMilestone(tutorID,uid, JSON.parse(queArray));
                 }	
                  notifyAPI.publishMsg('course/'+cid+'/user/'+uid+'/submit',{'questions':queArray},function(err,data){});				 
                 callback();		    
		    }
		],function(err) {			
	    });	
	}else{
	     studentPlanModel.updateStudentPlans(cid,uid,1,1 ,function(err,data){
		     console.log('update user s milestone');
		 })
	
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



/**************************************************************

       course test user submit

***************************************************************/
app.get('/course/:id/exam/group',getQuestionByGoup);
app.get('/course/:id/exam/qestion_answer',getQuestionAndAnswerByGoup);
function getQuestionByGoup(req,res,next){
    console.log('getQuestionByGoup',req.query.ids);
    var ids = req.query.ids;
    var locals = {};
	var idarray = ids.split(',');
	console.log(idarray.length);
	async.parallel([
	    function(callback) {
            questionModel.findQuestionsInGroup(idarray,'que tip',{},function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
                    locals.questions = data;	
                    callback();	
				}
			})           
		}],function(err){
	        if (err) return next(err);
		    console.log(req.accepted);
			
			if(req.accepts('application/json')){	
                console.log("'application/json'");			
			    res.json(200,locals);
			}
			else if(req.accepts('text/html')){
			    console.log("accepts('text/html')");
				locals.page = 'posts';					
                res.render('course/course_page_questions.ejs', locals.questions);
			}
	    });
}

function getQuestionAndAnswerByGoup(req,res,next){
    console.log('getQuestionAndAnswerByGoup',req.query.ids, req.query.sid);
    var ids = req.query.ids, sid = req.query.sid;
    var locals = {};
	var idarray = ids.split(',');
	console.log(idarray.length);
	async.parallel([
	    /*
	    function(callback) {
            questionModel.findQuestionsInGroup(idarray,'que tip',{},function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
                    locals.questions = data;	
                    callback();	
				}
			})           
		},
		*/
	    function(callback) {
            answerModel.getAnswersInGroup(sid,idarray,'anw debug qid verified right',function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
                    locals.answers = data;
                    console.log('answers'.green, data);					
                    callback();	
				}
			})           
		}
		],function(err){
	        if (err) return next(err);
		    //console.log(req.accepted);
			
			if(req.accepts('application/json')){	
                console.log("'application/json'");			
			    res.json(200,locals);
			}

	    });
}

