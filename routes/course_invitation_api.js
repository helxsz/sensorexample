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
var permissionAPI = require('./permission_api');
	
var errors = require('../utils/errors');

// tutor goes to the invitation
app.get('/course/:id/setting/invitation',permissionAPI.authUser,  permissionAPI.authTutorInCourse, getCourseInvitationPage);

// tutor send a email invitation
app.put('/course/:id/setting/invite',permissionAPI.authUser, permissionAPI.authTutorInCourse, inviteStudents);
app.post('/course/:id/setting/invite',permissionAPI.authUser,permissionAPI.authTutorInCourse, inviteStudents);

// tutor get a list of invitation
app.get('/course/:id/invitation',permissionAPI.authUser,permissionAPI.authTutorInCourse,getInvitationsFromCourse);

// tutor deletes a invitation
app.delete('/course/:id/invitation/:invitation_id',permissionAPI.authUser,permissionAPI.authTutorInCourse,deleteInvitationOfCourse);
function deleteInvitationOfCourse(cid,invitation_id,callback){


}

// tutor updates a invitation
app.put('/course/:id/invitation',permissionAPI.authUser,updateInvitationsOfCourse);
function updateInvitationsOfCourse(cid,invitation_id,callback){


}

// student replies to the invitation
app.post('/course/:id/invitation/:token/reply',replyToCourseInvitation);
app.get('/invitation/token/:token',getRegisterInvitationPage);

function getCourseInvitationPage(req,res,next){

    var locals = {};
    var cid = req.params.id;
    	
	async.parallel([
	    function(callback) {		
				loadUserProfileById(req.session.uid,function(err,data){
				    if(err){return callback(err); }
				    else{
					    locals.user = {username: data.username,email: data.email, img:data.img};						
					}
					callback();
				});
		},
		function(callback){	 
	        courseModel.findCourseInvitation(cid,function(err,data){
		        if(err)  next(err);
	            else{
			        //console.log("getInvitationsFromCourse ",data);
		            locals.invitations = data.invitations;
					for(var i=0;i<data.invitations.length;i++){
					    locals.invitations[i].time = moment( locals.invitations[i].time ).fromNow();
					}
					locals.course = {'_id':data._id};
	            }
                callback();				
	        })		
		}
		],function(err) {
	      if (err) return next(err); 
		  
		  if(req.xhr) return res.send({'data':null},200);
		  else res.format({
                    html: function(){
						 locals.title = 'Course Setting - Invitation';
						 locals.page = 'invitation';
                         res.render('course/course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals);
                    }
          });
	});	

}

function inviteStudents(req,res,next){

    var locals = {};
    var cid = req.params.id; 
    console.log(" inviteStudents".green,req.body.email);
	
	var email = req.body.email;
	email = sanitize(email).trim();
    try {      
       check(email).isEmail();
    } catch (e) {
	   console.log("email  is wrong".red);
       res.statusCode = 400;
       res.end(JSON.stringify({"error":"email is invalid"}));
       return;
    }
	
	
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
		    //var token = mongoose.Types.ObjectId();  // a new objectID in mongoose
            var token = (100000000000).toString(36);
            async.series([ 			
			    function(callback){
				    var reply_link = "/invitation/token/"+token;
					var sign_link = "/signup/invitation/?token="+token+"&email="+email+'&cid='+cid;
                    mail_api.sendInvitationMail(sign_link, locals.course.title, locals.course.summ ,email, function(error, response){
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
                /*				
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
		        }*/
		        function(callback){
		            courseModel.addInvitation(cid,email,token,email_status,function(err,data){
			            if(err) next(err);
	                    else{
				            console.log("addInvitation  success update".green);		    
	                    }
				        callback();					
					})
		        }				
				],function(err) {
				    if(!email_status) res.json(504);
					else  res.json(200);				
				})               				
	    });		
	
}

function getInvitationsFromCourse(req,res,next){

    var cid = req.params.id; 

	courseModel.findCourseInvitation(cid,function(err,data){
		if(err) {
		   res.send(500,{'errors':err});
		   next(err);
		}else if(data==null){
		    res.send(404);
		}
	    else{
			console.log("getInvitationsFromCourse ",data);
		    res.json(200,data);
	    }	    	
	})
}

// http://diogogmt.wordpress.com/2012/03/23/update-elementmatch-and-the-positional-operator-on-mongodbmongoose/
// http://stackoverflow.com/questions/15496071/finding-embedded-documents-in-mongoose-odm
// 'course/:id/invitation/:token/reply?action=accept&extra=afad'
function replyToCourseInvitation(req,res,next){
    var locals = {};
    var id = req.params.id;
	var token = req.params.token;
	var uid = req.session.uid;
    var action = req.query["action"],extra = req.query["extra"];
	console.log('replyToCourseInvitation',id,token,uid);
	courseModel.addStudentByInvitation(id,token,uid,function(err,data){
		    if(err) next(err);
			else if(!data || data==0) res.json(404,{'meta':204,'data':null});	
		    else res.json(200,{'meta':'200'});	 	
	})
	/*
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
	*/
	
}

function getRegisterInvitationPage(req,res,next){
    var locals = {};
	var token = req.params.token;
    res.render('first_invitation',locals);
}

/********************************************/

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
            callback(null,user);					
         }           					
	})			
}