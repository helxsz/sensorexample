var app = require('../app').app;
var courseModel = require('../model/course_model');
var userModel = require('../model/user_model');
var invitationModel = require('../model/invitation_model');
var	gridfs = require("./gridfs");

var async = require('async');
var fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');

var mail_api = require('./mail_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");
	
var notification_api = require('./notification_api');
	
var errors = require('../utils/errors');

// tutor goes to the invitation
app.get('/course/:id/setting/invitation',authTutor,getCourseInvitationPage);

// tutor send a email invitation
app.put('/course/:id/setting/invite',authTutor,inviteStudents);
app.post('/course/:id/setting/invite',authTutor,inviteStudents);

// tutor get a list of invitation
app.get('/course/:id/invitation',authTutor,getInvitationsFromCourse);

// tutor deletes a invitation
app.delete('/course/:id/invitation/:invitation_id',authTutor,deleteInvitationOfCourse);
function deleteInvitationOfCourse(cid,invitation_id,callback){


}

// tutor updates a invitation
app.put('/course/:id/invitation',authTutor,updateInvitationsOfCourse);
function updateInvitationsOfCourse(cid,invitation_id,callback){


}

// student replies to the invitation
app.get('course/:id/invitation/:token/reply',replyToCourseInvitation);

function getCourseInvitationPage(req,res,next){

    var locals = {};
    var cid = req.params.id;
    if( req.session.uid.length < 12) res.send(404,{'msg':'user id is not valid'});	
	
	async.parallel([
	    function(callback) {		
	       if (req.session.uid) {
		        console.log('getCourseSettingPage'.green, req.session.username,req.session.uid);
				if( req.session.uid.length < 12) res.send(404,{'msg':'user id is not valid'});
				else{
				    loadUserProfileById(req.session.uid,function(err,data){
				        if(err){return callback(err); }
				        else{
					        locals.user = {username: data.username,email: data.email};						
					    }
					    callback();
				    });
				}
			}else{
                callback();	
            }
		},
		function(callback) {
            courseModel.getCourseSetting(cid,function(err,data){
                if(err) next(err);
	            else{
	               //console.log('getCourseSettingPage success'.green,data.title,data.city);
				   console.log(data);
		           locals.course = data;
	            }
				callback();
            })
		},
		function(callback){	
           		
            courseModel.findCourseInvitationById(cid,function(err,data){
		        if(err) next(err);
	            else{
				   console.log("course invitation length".green, data.length);
		           locals.invitations = data;
	            }
                callback();				
	        })
		
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
					     console.log("course setting students");
						 locals.title = 'Course Setting';
						 locals.page = 'students';
                         res.render('course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	

}

function inviteStudents(req,res,next){

    var locals = {};
    var cid = req.params.id; 
    if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
    console.log(" inviteStudents".green,req.body.email);
	
	var email = req.body.email;
	/*
    try {      
       check(email).isEmail();
    } catch (e) {
	   console.log("email  is wrong");
       res.statusCode = 400;
       res.end(JSON.stringify({status:"error",errors:[{"message":"email is invalid"}]}));
       return;
    }
	*/
	
	console.log(email+"  is right ".green);
	async.series([
		function(callback) {
            courseModel.getCourseSetting(cid,function(err,data){
                if(err) next(err);
	            else{
	               //console.log('getCourseSettingPage success'.green,data.title,data.city);
				   console.log(data);
		           locals.course = data;
	            }
				callback();
            })
		}
		],function(err) {
	        if (err) return next(err); 
			// enum [ email_not_sent 0, email_failed 1, email_sent 2,  not_replyed 3, accpeted 4, refused 5, ]
		    var email_status = 0;
		    var token = mongoose.Types.ObjectId();  // a new objectID in mongoose
    
            async.series([ 			
			    function(callback){
                    mail_api.sendInvitationMail(cid, token , locals.course.title, locals.course.summ ,email, function(error, response){
                        if(error){
                            console.log("inviteStudents Message sent error ".red,error); // get error message
					        email_status = 1;			        
                        }else{
                            console.log("inviteStudents  Message sent: ".green ,response.message);
					        email_status = 2;			       
                        }
				        callback();
                    });								
				},			
		        function(callback){
		            invitationModel.createInvitation({'email':email,'_id':token,'status':email_status}, function(err,data){			
			            if(err) next(err);
	                    else{
				            console.log("invitationModel  id".green,data._id,token);
	                    }
				        callback();			
			    })
		       },
		        function(callback){
		            courseModel.addInvitationToList(cid,token,function(err,data){
			            if(err) next(err);
	                    else{
				            console.log("addInvitationToList  success update".green);
		    
	                    }
				        callback();					
					})
		        }],function(err) {
				    if(!email_status) res.json(200,"email sent error");
					else  res.json(200,"email sent successfully");				
				})			
	    });		
	
}

function getInvitationsFromCourse(req,res,next){

    var cid = req.params.id; 
    if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
    courseModel.findCourseInvitationById(cid,function(err,data){
		if(err) next(err);
	    else{
			console.log("getInvitationsFromCourse ",data);
		    res.json(200,data);
	    }	    	
	})
}

// 'course/:id/invitation/:token/reply?action=accept&extra=afad'
function replyToCourseInvitation(req,res,next){
    var locals = {};
    var id = req.params.id;
	var token = req.params.token;
    if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});	    
    var action = req.query["action"],extra = req.query["extra"];
	
	if(action=="accept"){
	    invitationModel.acceptInvitation(token,extra,function(err,data){
		    if(err) next(err);
		    else res.json(200,{'invitation_action':'accept'});				
		})
	}
	else if(action=="refuse"){
	    invitationModel.refuseInvitation(token,extra,function(err,data){
		    if(err) next(err);
		    else res.json(200,{'invitation_action':'refuse'});
		})	
	}
}
/********************************************/

function authTutor(req,res,next){
	if (req.session.uid) {
		 console.log('authAdmin'.green, req.session.username,req.session.uid);
		 if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
         else{		 		     
 		     courseModel.findCoursesByQuery({'tutor.id':req.session.uid,'_id':req.params.id},{'limit':20,'skip':0},function(err,course){
		      if(err) {
			     console.log('authTutor  Courses  not admined'.red);
				 next(err);
		      }
			  else{
			     console.log('authTutor  find course uid'.green,course._id);
			     next();
              }			
		    })
		}
	}else{
	    console.log('authTutor:  the user has no session id');
	    res.redirect('/login');
	} 
}

function authAdmin(req,res,next){
	if (req.session.uid) {
		 console.log('authAdmin'.green, req.session.username,req.session.uid);
		 if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
         else{		 		     
 		     courseModel.findCoursesByQuery({'tutor.id':{'$in':req.session.uid},'_id':req.params.id},{'limit':20,'skip':0},function(err,course){
		      if(err) {
			     console.log('Courses  not admined'.red);
		      }
			  else{
			     console.log('find course uid'.green,course._id);
			     next();
              }			
		    })
		}
	} 
}

function authStudents(req,res,next){
	if (req.session.uid) {
		 console.log('authAdmin'.green, req.session.username,req.session.uid);
		 if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
         else{		 		     
 		     courseModel.findCoursesByQuery({'tutor.id':{'$in':req.session.uid},'_id':req.params.id},{'limit':20,'skip':0},function(err,course){
		      if(err) {
			     console.log('Courses  not admined'.red);
		      }
			  else{
			     console.log('find course uid'.green,course._id);
			     next();
              }			
		    })
		}
	} 
}




/********************************************/

function loadUserProfileById(id,callback){
	userModel.findUserById(id,function(err,user){
		if(err) {
			console.log('user uid not found'.red);
			callback(err,null);
		}else if (!user){
		    var my_error =  new errors.DatabaseError(errors.error_code.USERID_NOT_FOUND);
			callback(my_error,null);
		    //callback( new Error("USER NOT FOUND"),null );
		}
		else{
			console.log('find user uid'.green,user._id);
            callback(null,user);					
         }           					
	})			
}