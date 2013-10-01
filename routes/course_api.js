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
var permissionAPI = require('./permission_api');

var followModel = require('../model/follow_model');
var courseLikeModel = require('../model/course_like_model');


var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");
	
var notification_api = require('./notification_api');
	
var errors = require('../utils/errors');	

app.get('/courses',getCourses);
app.get('/courses/popular',getPopularCourses);

function getPopularCourses(req,res,next){

}

function getCourses(req,res,next){
    var locals = {};	
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:10, option = {'skip':skip,'limit':limit};

	async.parallel([
		function(callback) {
		   courseModel.findCoursesByQuery({},option,function(err,courses){
		            if(err) {
			            console.log('course uid not found'.red,err);
		            }
			        else{
			            console.log('find courses'.green,courses.length);			   
                        locals.courses = courses; 
                    }
				    callback();	
		   })
		  		
		}],function(err) {
	      if (err) {
		    console.log(err);
		    next(err);
			return;
          }				   
			if(req.accepts('text/html')){
				res.redirect('/');
			}
			else if(req.accepts('application/json')){
			    res.json(locals.courses);
			}
	});	 
	
}


app.get('/course/:id',getCourseDetail);
app.get('/course/:id/students',getCourseDetailOnStudents);
app.get('/course/:id/posts',getCourseDetailOnPosts);
//app.get('/course/:id/comments',getCourseDetailOnComments);
/*
app.get('/course/:id/questions',getCourseDetailOnQuestions);
function getCourseDetailOnQuestions(req,res,next){
    console.log('getCourseDetailOnQuestions',req.params.id);   
    var locals = {};

	async.parallel([
	    function(callback) {
           callback();		
		}],function(err){
	      if (err) return next(err); 
		  console.log('questions');
	      res.format({		        
                    html: function(){
					     locals.page = 'posts';					
                         res.render('course/course_page_questions.ejs', locals);
                    },
					
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	
}
*/

function getCourseDetailOnPosts(req,res,next){
    console.log('getCourseDetailOnPosts',req.params.id); 
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:50, option = {'skip':skip,'limit':limit};
	
    var locals = {};

	async.parallel([
	    function(callback) {
            courseModel.findCoursePostsById(req.params.id,function(err,data){
			    if(err) { next(err); callback();	}
	            else{
				    console.log(data.post.length);

					for(var i=0;i<data.post.length;i++){				   
				   
					}
					locals.posts = data.post;
                    callback();	
				}
			})           
		}],function(err){
	      if (err) return next(err); 
/*		  
		  if(req.xhr){
		    res.send(locals.posts);
		    return;
		  }		  
*/		  
	      res.format({		        
                    html: function(){
					     locals.page = 'posts';					
                         res.render('course_page_posts', locals.posts);
                    },
					
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });	
}

function getCourseDetailOnStudents(req,res,next){
    console.log('getCourseDetailOnStudents',req.params.id);  
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:50, option = {'skip':skip,'limit':limit};
	
    var locals = {};
	async.parallel([
	    function(callback) {
            courseModel.findCourseStudentsById(req.params.id,function(err,data){
			    if(err) { next(err); callback();	}
	            else{
				    console.log('students',data.stud.length);
					locals.students = data.stud;
                    callback();	
				}
			})           
		}],function(err){
	      if (err) return next(err); 
		  /*
		  if(req.xhr){
		    console.log('ajax xhr');
		    res.send(locals.students);
		    return;
		  }
		  */
	      res.format({
		        
                    html: function(){
					     locals.page = 'students';					
                         res.render('course/course_page_students.ejs', locals);
                    },
					
                    json: function(){
                         res.send(locals.students);
                    }
                  });
	    });	
}

function getCourseDetail(req,res,next){
    console.log('getCourseDetail',req.params.id);   
    var locals = {};
	async.series([
        function(callback) {	
	       if (req.session.uid) {
				if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
				else{												    				
				    loadUserProfileById(req.session.uid,function(err,data){
				        if(err){return callback(err); }
				        else{
						    locals.loggedin=true;
						    locals.user = {username: data.username,email: data.email, img:data.img,id:data._id,isStudent:false};
							console.log('user',locals.user);
                            callback();							
					    }
				    });
				}
			}else{
			    locals.loggedin=false;
                callback();	
            }
		},function(callback){
		    if (req.session.uid){
		        notification_api.pullUserNotificationCount(req.session.uid,function(err,data){							
				    if(data&& !err){ 
				        console.log('nofi ',data);
				        locals.user.notification = data;  
				    }
				    callback();
			   });
		    }else{
			     callback();
			}
		},function(callback) {
            courseModel.findCourseAndTutorById(req.params.id,function(err,data){
			    if(err) { console.log('error1'.red); return next(err); 	}
				else if(!data){ console.log("can't find course id".red); return next(null);}
	            else{
				    //console.log('students'.red,data.stud.length,data);
					locals.course = data;
					locals.title = data.title;
					locals.tutor = {
					    'name': data.tutor.id.username,
                        'img':data.tutor.id.img,
                        'about':data.tutor.id.about,
                        'id':data.tutor.id._id,
                        'isStudent':false,
                        'isTutor':false						
					};
					//locals.user.isStudent = false;
					////////////////////////////////////////////////////////////
					if(req.session.uid == null){

					}
					else{
					 
					 for(var i=0;i<data.stud.length;i++){				   
					    console.log(data.stud[i]);
						if(data.stud[i]==req.session.uid){
						    console.log('is student   '.green);
							locals.user.isStudent = true;
							break;
						}					   
					 }	
										
					 if(data.tutor.id._id == req.session.uid) 
					 {				
                        console.log('is tutor   '.green, locals.tutor.name,locals.tutor.id 	);					
					    locals.user.isTutor = true;
					 }
					} 
                    callback();	
				}
			})           			            
		},	
		function(callback) {
		    if (req.session.uid){		
                followModel.inFollowList(req.session.uid,locals.tutor.id.toString(),function(err,data){
                    if(err) next(err);
	                else{
		                console.log('get tutuor in follow list'.green,data);
					    if(data!=null){
						    locals.tutor.follow = 1;
					    }
		            }
                    callback();				
                })
            }else{
			     callback();
			}				
		},
		function(callback) {
		    if (req.session.uid){  		
                courseLikeModel.inLikeList(req.params.id,req.session.uid,function(err,data){
                    if(err) next(err);
	                else{
		                console.log('get course in my like list'.green,data);
					    if(data!=null){
						locals.course.like = 1;
					   }
		            }
                    callback();				
                })
            }else{
			    callback();
			}				
		}],function(err){
	      if (err) { console.log('err3'.red);return next(err); }	 		  
	      res.format({
                    html: function(){
					     locals.page = 'home';
                         res.render('course_description', locals);
                    },
                    json: function(){
                         res.send(locals);
                    }
                  });
	    });	
}





/*********************
    user course api
	
	http://redis.io/topics/twitter-clone
	
*********************/
app.get('/discover/course',getRecentCourses);
app.get('/user/:userid',getCourseByUser);


function getRecentCourses(req,res,next){
    console.log(req.url,req.url.length);
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:50, option = {'skip':skip,'limit':limit};
	
	var locals = {};
	async.parallel([
	    function(callback) {		
	       if (req.session.uid) {
		        console.log('retrieve logined page'.green, req.session.username,req.session.uid);
				if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});
				else{
				    loadUserProfileById(req.session.uid,function(err,data){
				        if(err){ callback(err);  }
				        else{
					        locals.user = {username: data.username,email: data.email, img:data.img};
                            callback();							
					    }
					    
				    });
				}
			}else{
                callback();	
            }
		},
		function(callback) {		  
                loadCourses(option,function(err,data){
				    if(err){return callback(err); }
				    else{ locals.courses = data;}
					callback();
				});
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
					     console.log('getRecentCourses  html');
						 locals.title = 'Recent Courses';
                         res.render('course_recent', locals);
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });		
}


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

function loadCourses(option,callback){ //'acti':true
	courseModel.findCoursesByQuery({},option,function(err,courses){
		if(err) {
		         console.log('course uid not found'.red,err);
		         callback(err,null);
		}else if (!courses){
		    var my_error =  new errors.DatabaseError(errors.error_code.COURSEID_NOT_FOUND);
			callback(my_error,null);
		    //callback( new Error("COURSE NOT FOUND"),null );
		}else{
			console.log('find courses'.green,courses.length);
            callback(null,courses);								
        }
	})
}


function getCourseByUser(req,res){
	console.log('/quiz/:id');	
	res.send('finish');
}




function belongToCourseGroup(){



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

function loadCourses(option,callback){ //'acti':true
	courseModel.findCoursesByQuery({},option,function(err,courses){
		if(err) {
		         console.log('course uid not found'.red,err);
		         callback(err,null);
		}else if (!courses){
		    var my_error =  new errors.DatabaseError(errors.error_code.COURSEID_NOT_FOUND);
			callback(my_error,null);
		    //callback( new Error("COURSE NOT FOUND"),null );
		}else{
			console.log('find courses'.green,courses.length);
            callback(null,courses);								
        }
	})
}


/****************************************************


*****************************************************/
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
		console.log('authAdmin'.green, req.session.username,req.session.uid);
	 		     
 		courseModel.findCoursesByQuery({'tutor.id':req.session.uid,'_id':req.params.id},{'limit':20,'skip':0},function(err,course){
		      if(err) {
			     console.log('Courses  not admined'.red);
		      }
			  else{
			     console.log('find course uid'.green,course._id);
			     next();
              }			
		}) 
}


