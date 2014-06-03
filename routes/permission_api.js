var crypto = require('crypto'),
    moment = require('moment'),
    color = require('colors'),
    async = require('async'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;
	
	
var userModel = require('../model/user_model');	
    courseModel = require('../model/course_model');	
    config = require('../conf/config.js');
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js'); 
	
	
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


function basicAuth(req, res, next) {
  var auth, parts, plain
  if (!(auth = req.get('authorization'))) return next()
  parts = auth.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic') return next()
  try {
    plain = new Buffer(parts[1], 'base64').toString().split(':')
  } catch (e) {
    console.error('Invalid base64 in auth header')
    return next()
  }
  if (plain.length < 2) {
    console.error('Invalid auth header')
    return next()
  }
/*
  User.authenticate(plain[0], plain.slice(1).join(':'), function (err, user) {
    if (err || !user) {
      console.log("basic auth: user not found");
      return res.send(401, 'Invalid username/password in basic auth')
    }
    req.user = user
    return next()
  })
  */
}


var requireUser = function require_auth(req, res, next) {
  if (req.user !== undefined) {
    next();
  } else {
    req.session.return_to = req.url
    res.redirect("/login");
  }
};

var requireUserOr401 = function (req, res, next){
  if (req.user !== undefined){
    next();
  } else {
    res.statusCode = 401;
    res.end("not authorized");
  }
};

// Require admin privileges
var requireAdminOr401 = function require_admin(req, res, next){
  if (req.user === undefined ||
        req.user['account_level'] === undefined ||
        req.user.account_level < 1){
      res.statusCode = 401;
      res.end("not authorized");
  } else {
      next();
  }
};



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



module.exports = {
    authUser: authUser
   ,authUser1: authUser1
   ,cipherSessionParameter :cipherSessionParameter
   ,deciphterSessionParameter: deciphterSessionParameter
   ,authStudentInCourse :authStudentInCourse
   ,authTutorInCourse : authTutorInCourse
   // Auth middleware
   , requireUser: requireUser
   , requireUserOr401: requireUserOr401
   , requireAdminOr401: requireAdminOr401
}