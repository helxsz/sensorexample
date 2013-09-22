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
		 console.log('authUser middleware'.green, req.session.username,req.session.uid);
		 next();
	 } else {
		 console.log('retrieve login page  not uid'.red,'go to login page');
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
		 console.log('authUser middleware'.green, req.session.username,req.session.uid);
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
		 console.log('retrieve login page  not uid'.red,'go to login page');
		 res.redirect('/login');
	 }
}

function authStudentInCourse(req,res,next){
		console.log('authStudents'.green, req.session.username,req.session.uid,'cid',req.params.id);
		 	//	     
 		//courseModel.findCourseByQuery({'_id':req.params.id,'stud.$':req.session.uid},'title',function(err,course){
		// http://stackoverflow.com/questions/16198429/mongodb-how-to-find-out-if-an-array-field-contains-an-element
		courseModel.findCourseByQuery({'_id':req.params.id,'stud':{'$in':[req.session.uid]}},'title',function(err,course){
		      if(err || !course) {
			     console.log('Courses  not admined'.red);
				 res.json(403);
				 return;
		      }
			  else{
			     console.log('authStudents find student in the course'.green,course._id);
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
exports.authUser = authUser;
exports.authUser1 = authUser1;
exports.cipherSessionParameter = cipherSessionParameter;
exports.deciphterSessionParameter =deciphterSessionParameter;