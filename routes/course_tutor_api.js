var async = require('async'),
    fs = require('fs'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment');

var app = require('../app').app,
    account_api = require('./account_api'),
    permissionAPI = require('./permission_api'),
    notifyAPI = require('./notification_api'),
    studentPlanModel = require('../model/student_plan_model'),
    answerModel = require('../model/student_answer_model'),
    helpModel = require('../model/help_model'),
    userModel = require('../model/user_model'),
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    questionModel = require('../model/question_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js');  	
	

app.get('/profile/:username/tutor',permissionAPI.authUser,getTutorDashboardPage);
app.post('/profile/:username/tutor',permissionAPI.authUser, createTutorProfile);
app.put('/profile/:username/tutor',permissionAPI.authUser, updateTutorProfile);
app.del('/profile/:username/tutor',permissionAPI.authUser,delTutorProfile);
function getTutorDashboardPage(req,res,next){
    var locals = {};
    var id = req.params.id;
	var uid = req.session.uid;
	if(req.params.username != req.session.username){
	    req.send(403);
		return;
	}
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
                         res.send(200);
                    }
                  });
	    });	
}

function createTutorProfile(req,res,next){
    var locals = {};
    var id = req.params.id;
	var uid = req.session.uid;
	if(req.params.username != req.session.username){
	    req.send(403);
		return;
	}

	var update = new Object();
    if(req.body.skills)   {   update.tutor.skills = sanitize(req.body.skills).trim(), update.tutor.skills = sanitize(update.tutor.skills).xss();  }
    if(req.body.experience)  {   update.tutor.fullname = sanitize(req.body.experience).trim(), update.tutor.experience = sanitize(update.tutor.experience).xss();  }
	
	async.parallel([
		function(callback) {
            userModel.updateUser({'_id':req.session.uid},{'$set':update},function(err,data){
	            if(err){ 
				    if(req.xhr)  return res.send({'error':err.err},406);
	                next(err);		 
				}
			    else if(!data || data ==0){ console.log('update failed '.green);}
				else if(data ==1) console.log('update success'.green);
				callback();
			})		    
		}],function(err) {
	            if(err){ 
				    if(req.xhr)  return res.send({'error':err.err},406);
	                next(err);		 
				}
	  
				if(req.xhr) res.send(201)
		        else 
	            res.format({
                    html: function(){
						 locals.title = 'Tutor Dashboard';
                         res.render('dashboard_tutor',locals);			
                    },
                    json: function(){
                    }
                });
	    });	    
}

function updateTutorProfile(req, res, next){
    var locals = {};
    var id = req.params.id;
	var uid = req.session.uid;
	if(req.params.username != req.session.username){
	    req.send(403);
		return;
	}	
	
	var update = new Object();
    if(req.body.skills)   {   update.tutor.skills = sanitize(req.body.skills).trim(), update.tutor.skills = sanitize(update.tutor.skills).xss();  }
    if(req.body.experience)  {   update.tutor.fullname = sanitize(req.body.experience).trim(), update.tutor.experience = sanitize(update.tutor.experience).xss();  }
	
	async.parallel([
		function(callback) {
            userModel.updateUser({'_id':req.session.uid},{'$set':update},function(err,data){
	            if(err){ 
				    if(req.xhr)  return res.send({'error':err.err},406);
	                next(err);		 
				}
			    else if(!data || data ==0){ console.log('update failed '.green);}
				else if(data ==1) console.log('update success'.green);
				callback();
			})		    
		}],function(err) {
	            if(err){ 
				    if(req.xhr)  return res.send({'error':err.err},406);
	                next(err);		 
				}
				
				if(req.xhr) res.send(201)
		        else 
	            res.format({
                    html: function(){
						 locals.title = 'Tutor Dashboard';
                         res.render('dashboard_tutor',locals);			
                    },
                    json: function(){
                    }
                });
	    });	
}

function delTutorProfile(req, res, next){
    var locals = {};
    var id = req.params.id;
	var uid = req.session.uid;
	if(req.params.username != req.session.username){
	    req.send(403);
		return;
	}	
	async.parallel([
		function(callback) {
            userModel.updateUser({'_id':req.session.uid},{'$set':{'tutor':''}},function(err,data){
	            if(err){ 
				    if(req.xhr)  return res.send({'error':err.err},406);
	                next(err);		 
				}
			    else if(!data || data ==0){ console.log('update failed '.green);}
				else if(data ==1) console.log('update success'.green);
				callback();
			})		    
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

app.get('/course/:id/tracking',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage);
app.get('/course/:id/tracking1',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage1);
app.get('/course/:id/tracking2',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage2);
app.get('/course/:id/tracking3',permissionAPI.authUser, permissionAPI.authTutorInCourse, getCourseTrackingPage3);
app.get('/course/:id/planAllocation',permissionAPI.authUser, permissionAPI.authTutorInCourse,getPlanAllocation);
app.get('/course/:id/planAllocation2',permissionAPI.authUser, permissionAPI.authTutorInCourse,getPlanAllocation2);
app.get('/course/:id/planAllocation3',  getPlanAllocation3);




function getCourseTrackingPage(req,res,next){
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
						 locals.title = 'Course Tracking';
                         res.render('course_tracking4',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});	    
}

function getCourseTrackingPage1(req,res,next){
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
						 locals.title = 'Course Tracking';
                         res.render('course_tracking2',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});	    
}

function getCourseTrackingPage3(req,res,next){
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
						 locals.title = 'Course Tracking';
                         res.render('course_tracking4',locals);			
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
						 locals.title = 'Course Allocation';
                         res.render('course_plan_allocation3',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	});
}

/***************************************************************************
            tutor reply answer, help
*****************************************************************************/
app.get('/course/:id/tutor/help',permissionAPI.authUser, permissionAPI.authTutorInCourse, getHelpFromStudent);
app.get('/course/:id/tutor/replyhelp',permissionAPI.authUser, permissionAPI.authTutorInCourse, replyHelpToStudent);
function getHelpFromStudent(req,res,next){
    var course_id = req.params.id, student_id = req.query.sid, question_id = req.query.qid;
    console.log('callTutorForHlep',course_id,student_id, question_id );
    helpModel.findHelpByQuery({ 'course':course_id,'user':student_id,'question':question_id },function(err,data){
        if(err) next(err);
        else {
		   console.log('findHelpByQuery',data);
           if(data == null){
		       res.send(404,{ "meta": { "code": 404} });
		   }else{
		       res.send(200,{ "meta": { "code": 200},"data":data.chats });
		   }
		}
    })
}



function replyHelpToStudent(req,res,next){
    var course_id = req.params.id, student_id = req.query.sid, question_id = req.query.qid, msg = req.query.msg;
	var uid = req.session.uid;
	
    notifyAPI.readAndRemoveUserNotification(uid,0,function(err,data){
	    if(err) console.log('replyHelpToStudent'.red);
	    console.log('replyHelpToStudent'.green);
	
	});	
	notifyAPI.notifyStudentOnHelp(sid,uid,question_id,msg,function(err,data){
	    if(err) console.log('notifyStudentOnSolution'.red);
	    console.log('notifyStudentOnSolution'.green,data);		
	})	
	
	notifyAPI.publishMsg('course/'+course_id+'/tutor/'+uid+'/reply',{'type':'help','msg':msg,'qid':question_id},function(err,data){});
	
    console.log('callTutorForHlep ','cid',course_id,'uid',student_id, 'qid',question_id, 'msg',msg);
	//if(tutorID)  notifyAPI.notifyTutorOnHelp(tutorID,student_id, question_id,msg);	        		  
    helpModel.updateHelp( { 'course':course_id,'user':student_id,'question':question_id },{'$push':{'chats':{'t':new Date().getTime(),'m':msg, 'r':1}}},function(err,update){
            if(err) next(err);
            else {
		        console.log('',update);  
                if(update == 1){
					res.send(200,{ "meta": { "code": 200} });
				}else{
					res.send(404,{ "meta": { "code": 404} });
				}						 
		    }
    })   
}

app.get('/course/:id/tutor/permit',  permissionAPI.authUser, permissionAPI.authTutorInCourse,permitAnswer);
function permitAnswer(req, res, next){

    console.log('permitAnswer',req.query.sid, req.query.content);
	var sid = req.query.sid;
	var uid = req.session.uid;
	var questions = req.query.content.split(',');

    notifyAPI.readAndRemoveUserNotification(uid,0,function(err,data){
	    if(err) console.log('permitAnswer'.red);
	    console.log('permitAnswer'.green,data);
	
	});		
	notifyAPI.notifyStudentOnSolution(sid,uid,questions,function(err,data){
	    if(err) console.log('notifyStudentOnSolution'.red);
	    console.log('notifyStudentOnSolution'.green,data);		
	})
	
	notifyAPI.publishMsg('course/'+course_id+'/tutor/'+uid+'/reply',{'type':'question','questions':questions},function(err,data){});
	
	
	async.forEach(questions, function(item, callback) {
	    var ss = item.split('_');
	    console.log(ss[0],ss[1]);
        var bol = false;		
		if(ss[1]=='1' || ss[1]==1) bol = true;
		else if(ss[1]=='0' || ss[1]==0) bol = false;
        answerModel.verifyAnswer(sid,ss[0],bol,function(err,data){
		    console.log('answerModel.verifyAnswer '.green,data);
		    callback();
		})        
    }, function(err) {
	    if(err) console.log('permit anawer'.red,err);
		else {console.log('> done');res.send(200);}      
    });
}
