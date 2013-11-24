var async = require('async'),
    fs = require('fs'),
    colors = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment');

var app = require('../app').app,
    permissionAPI = require('./permission_api'),
    notification_api = require('./notification_api'),
    followModel = require('../model/follow_model'),
    courseLikeModel = require('../model/course_like_model'),
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js');

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

          if(req.xhr){
		       res.send(200,locals.courses);
		  }else{
			   if(req.accepts('text/html')){
				   res.redirect('/');
			   }
			   else if(req.accepts('application/json')){
			       res.json(locals.courses);
			   }	  
		  }		  

	});	 
	
}


app.get('/course/:id/json',getCourseSimpleDetail);
function getCourseSimpleDetail(req,res,next){
    console.log('getCourseDetail',req.params.id);   
    var locals = {};
	async.series([
         function(callback) {
            courseModel.findCourseAndTutorById2(req.params.id,function(err,data){
			    if(err) { console.log('error1'.red); return next(err); 	}
				else if(!data){ console.log("can't find course id".red); return next(null);}
	            else{
					locals.course = data;
                    callback();	
				}
			})           			            
		}],function(err){
	      if (err) { console.log('err3'.red);return next(err); }	 		  
          res.send(200,locals);
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
		}
		/*
		,function(callback){
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
		}*/
		,function(callback) {
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




