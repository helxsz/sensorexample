var moment = require('moment');
require('colors');
var async = require('async');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var userModel = require('../model/user_model');	
var courseModel = require('../model/course_model');	
var crypto = require('crypto');
var config = require('../conf/config.js');
	
function authUser(req,res,next){

     var cookie_uid = req.cookies['uid'];
	 var cookie_auth =  req.cookies['auth'];
	 var signed_uid,signed_auth;
	 if(cookie_uid)
	 signed_uid = deciphterSessionParameter(cookie_uid,config.sessionSecret);
	 if(cookie_auth)
	 signed_auth = deciphterSessionParameter(cookie_auth,config.sessionSecret);

	 if (req.session.uid) {
		 //console.log('authUser middleware'.green, req.session.username,req.session.uid);
		 if( req.session.uid.length < 12) return res.send(400,{'error':'InvalidAuthenticationInfo:user id is not valid'});	
		 next();
	 } else {
		 if(req.xhr) return res.send(403,{'error':'InsufficientAccountPermissions'});
		  res.redirect('/login');
	 }
}

function authUser1(req,res,next){

     var cookie_uid = req.cookies['uid'];
	 var cookie_auth =  req.cookies['auth'];
	 var signed_uid,signed_auth;
	 if(cookie_uid)
	 signed_uid = deciphterSessionParameter(cookie_uid,config.sessionSecret);
	 if(cookie_auth)
	 signed_auth = deciphterSessionParameter(cookie_auth,config.sessionSecret);

	 if (req.session.uid) {
		 //console.log('authUser middleware'.green, req.session.username,req.session.uid);
		 userModel.findUserById(req.session.uid,function(err,user){
		    if(err || !user) {
			    console.log('user uid not found'.red);
		        res.redirect('/login');
		    }
			else{			
			   console.log('authUser  find user uid'.green,user._id);	
               req.user = user;			   
			   next();
            }			
		 })		 
	 } else {
		 if(req.xhr) res.send(403);
		 else res.redirect('/login');
	 }
}

function authStudentInCourse(req,res,next){
		//console.log('authStudents'.green, req.session.username,req.session.uid,'cid',req.params.id);
		 	//	     
 		//courseModel.findCourseByQuery({'_id':req.params.id,'stud.$':req.session.uid},'title',function(err,course){
		// http://stackoverflow.com/questions/16198429/mongodb-how-to-find-out-if-an-array-field-contains-an-element
		var course_id = req.params.id, uid = req.session.uid;
		courseModel.findCourseByQuery({'_id':course_id,'stud':{'$in':[uid]}},'title',function(err,course){
		      if(err || !course) {
			     console.log('Courses  not admined'.red);
				 if (req.xhr) {
				    res.json(403,{'error':'InsufficientAccountPermissions:not authenticated, please apply for the course first'});
				 }else{
				    res.render('error/403', { error: 'not authenticated, please apply for the course first' });
				 }
				 return;
		      }
			  else{
			     console.log('authStudents find student in the course'.green,course._id);
			     next();
              }			
		})
}

function authTutorInCourse(req,res,next){
		//console.log('authTutorInCourse'.green, req.session.username,req.session.uid,'cid',req.params.id);

		var course_id = req.params.id, uid = req.session.uid;
		courseModel.findCourseByQuery({'_id':course_id,'tutor.id':uid},'title',function(err,course){
		      if(err || !course) {
			     console.log('authTutorInCourse , Courses  not admined to you'.red,err);
				 if (req.xhr) {
				    res.json(403,{'error':'InsufficientAccountPermissions: not authenticated to non tutor'});
				 }else{
				    res.render('error/403', { error: 'not authenticated' });
				 }
				 return;
		      }
			  else{
			     console.log('auth Tutor in the course'.green,course._id);
			     next();
              }			
		})
}

/*******************************************************
              client session
*******************************************************/

function cipherSessionParameter(str,secret){
   var password = secret, str = str;
   //console.log('cipherSessionId',uid,password);
   var cipher = crypto.createCipher("rc4", password);
   var ciphered = cipher.update(str.toString(), "utf8", "hex");
   ciphered += cipher.final("hex");
   //console.log('ciphered£º' + ciphered);
   return ciphered;
}

function deciphterSessionParameter(str,secret){
   var password = secret, str = str;
   var decipher = crypto.createDecipher("rc4", password);
   var deciphered = decipher.update(str.toString(), "hex", "utf8");
   deciphered += decipher.final("utf8");
   //console.log('deciphered£º' + deciphered);
   return deciphered;
}

exports.authStudentInCourse =authStudentInCourse;
exports.authTutorInCourse = authTutorInCourse;

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};
 
// Check for admin middleware, this is unrelated to passport.js
// You can delete this if you use different method to check for admins or don't need admins
exports.ensureAdmin = function ensureAdmin(req, res, next) {
        if(req.user && req.user.admin === true)
            next();
        else
            res.send(403);
};


exports.authUser = authUser;
exports.authUser1 = authUser1;
exports.cipherSessionParameter = cipherSessionParameter;
exports.deciphterSessionParameter =deciphterSessionParameter;