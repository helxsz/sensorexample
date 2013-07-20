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
/*********************
    admin course api
*********************/

app.post('/course/new/guide',createCourseFromGuide);
function createCourseFromGuide(req,res,next){
	console.log('createCourseFromGuide '.green,req.session.uid);
	//return res.send(200,{'uid':req.session.uid});
	
	courseModel.createNewCourse({'tutor.id':mongoose.Types.ObjectId(req.session.uid),'tutor.name':req.session.name,'acti':false},function(err,data){	
	    res.format({
                    html: function(){
					     console.log('createCourseFromGuide  created course with id',data._id);
                         res.redirect('/course/'+data._id+'/setting');
                    },
                    json: function(){
                         res.send(200);
                    }
        });	  
	});
}

app.get('/course/:id/setting/questions',authTutor,getCourseSettingQuestionPage);
app.get('/course/:id/setting',authTutor,getCourseSettingPage);
app.put('/course/:id/setting',authTutor,updateCourseSetting);
app.put('/course/:id/setting/image',authTutor,updateImageToGridfs);
app.get('/course/image/:id',authTutor,getImageFromGrids);




function getCourseSettingPage(req,res,next){
    var locals = {};
    var id = req.params.id;
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
            courseModel.getCourseSetting(req.params.id,function(err,data){
                if(err) next(err);
	            else{
	               //console.log('getCourseSettingPage success'.green,data.title,data.city);
				   console.log(data);
		           locals.course = data;
	            }
				callback();
            })
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Setting';
						 locals.page = 'basic';
                         res.render('course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });		
}

function getCourseSettingQuestionPage(req,res,next){
    var locals = {};
    var id = req.params.id;
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
            courseModel.getCourseSetting(req.params.id,function(err,data){
                if(err) {next(err);callback();}
	            else{
	               //console.log('getCourseSettingPage success'.green,data.title,data.city);
				   console.log(data);
		           locals.course = data;
				   callback();
	            }
				
            })
		    
		},
		function(callback) {
            courseModel.findCourseQuestionsById(req.params.id,function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
				    locals.ques = data;
                    locals.course_id = req.params.id;					
                    callback();	
				}
			})           
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						 locals.title = 'Course Setting';
						 locals.page = 'question';
                         res.render('course_setting',locals);			
                    },
                    json: function(){
                         res.send(locals.courses);
                    }
                  });
	    });		
}



function updateCourseSetting(req,res,next){
    var locals = {};
    var id = req.params.id; 
    if( req.session.uid.length < 12) res.send(404,{'msg':'course id is not valid'});

	var title,summary,description,city,tags,category,date_start,date_end;
	if(req.body.title) { title = sanitize(req.body.title).trim(), title = sanitize(title).xss(); }
	if(req.body.description) { description = sanitize(req.body.description).trim(), description = sanitize(description).xss(); }
	if(req.body.city) { city =  sanitize(req.body.city).trim(), city = sanitize(city).xss(); }
	if(req.body.tags) { tags =  sanitize(req.body.tags).trim(), tags = sanitize(tags).xss(); }
	
	if(req.body.date_start) { date_start =  sanitize(req.body.date_start).trim(), date_start = sanitize(date_start).xss(); }
	if(req.body.date_end) { date_end =  sanitize(req.body.date_end).trim(), date_end = sanitize(date_end).xss(); }
	if(req.body.category) { category =  sanitize(req.body.category).trim(), category = sanitize(category).xss(); }
	if(req.body.summary) { summary =  sanitize(req.body.summary).trim(), summary = sanitize(summary).xss(); }
	//date_start = req.body.date_start, date_end = req.body.date_end, category = req.body.category, summary = req.body.summary;	
	//console.log('image',req.files.image.type,req.files.image.path);
	console.log(title,description,city,tags,category,date_start,date_end,summary,req.body.course_id);
	//console.log('start..'.green, moment(date_start, "DD-MM-YYYY"),moment(date_end, "DD-MM-YYYY"));
    console.log('start..'.green, new Date(date_start).toString(),new Date(date_end).toString());
	//return res.redirect(req.url);
	
    courseModel.updateCourseSetting({'_id':req.body.course_id}, {'$set':{'title':title,'desc':description,'city':city,'tags':tags.split(',')||''
	                                  ,'summ':summary,'cate':category,'sdate':new Date(date_start),'edate':new Date(date_end)
	                                }}
         ,function(err,data){
        if(err) next(err);
	    else{
	        console.log('updateCourseSetting success'.green,data.title,data.city);
		    locals.course = data;
            //res.redirect(req.url);
            
			res.format({
                html: function(){
					//locals.title = 'Course Setting';
                    res.redirect(req.url);			
                },
                    json: function(){
                        res.send(200,'update:success');
                    }
            });
	    }
    })     
}

function updateImageToGridfs(req,res,next){
	var file = req.files.image;
	console.log('updatecourseImageToMongo'.green,file.path,file.type,file.size);
	
	if (req.body.course_id) {
		 courseModel.findCourseById(req.body.course_id,function(err,course){
		    if(err) {
			    console.log('course uid not found'.red);
				next(err);
				return;
		    }
			else{
			    console.log('find course uid'.green,course._id);
                var	fileHash = crypto.createHash('md5').update(file.path + '' + (new Date()).getTime()).digest('hex');
	            var newFileName = (fileHash + file.type);
				
				if(course.img){
				    console.log('old image is ',course.img);
				    gridfs.deleteByID(course.img,function(err,result){					
					    if(err) next(err)
						else console.log('delete the old image'.green,course.img);
					})
				}
/*				
	im.resize({
        srcPath: file.path,
        dstPath: 'lala.jpg',
        width: 32,
        height: 32,
        quality: 1
    }, function(err, stdout, stderr) {
         console.log('stdout'.green,stdout);
         console.log('stderr'.green,stderr);
         console.log('error'.red,err);
		 
		fs.unlink(file.path,function (err) {
            if (err) throw err;
            console.log('successfully deleted /tmp/hello');
        });
		fs.unlink('lala.jpg',function (err) {
            if (err) throw err;
            console.log('successfully deleted lala.jpg');
        });
    });				
*/				
				gridfs.putFileWithID(file.path, newFileName, newFileName, {'content_type':file.type,'chunk_size':file.size,metadata: { "id": course._id}}, function(err1, result) {
                    
				    fs.unlink(file.path,function (err) {
                        if (err) throw err;
                        console.log('successfully deleted'.green,file.path);
                    });
					
					if(err) return next(err1);
					
					console.log('save image into gridid'.green,result._id,newFileName);
					course.img = result._id;
					course.save(function (err2) {
                            if (err) return next(err2); 
							else console.log('save course image');
			                res.redirect("/settings/profile");
							//res.send(200);
                    });
				})
            }			
		 })
	}	
}

function getImageFromGrids(req,res,next){
    if(req.params.id ==null)
	    return 	res.send(404,{'error':'image not found'});
	if(req.params.id == undefined){
	
	   console.log('id undenfined');
	   res.send(404,{'error':'image not found'});
	   return;
	}	
	console.log('getImageFromGrids ',req.params.id);
	gridfs.get(req.params.id, function(err, file) {
	    if(err)  return res.send(404,{'error':'image not found'});
		res.header("Content-Type",  file.contentType);  //'application/octet-stream'
		res.header("Content-Disposition", "attachment; filename=" + file.filename);
		res.header('Content-Length', file.length);
				    return file.stream(true).pipe(res);
	});	
}



app.get('/new/course', permissionAPI.authUser,startNewCoursePage);
app.post('/course/new',permissionAPI.authUser,startNewCourse);



app.del('/course/:id',authTutor,deleteCourse);

app.get('/course/:id',getCourseDetail);
app.get('/course/:id/students',getCourseDetailOnStudents);
app.get('/course/:id/posts',getCourseDetailOnPosts);
//app.get('/course/:id/comments',getCourseDetailOnComments);
app.get('/course/:id/questions',getCourseDetailOnQuestions);



function startNewCoursePage(req,res,next){
    var locals = {};
	console.log('startNewCoursePage');

	async.parallel([
	    function(callback) {		
	       if (req.session.uid) {
		        console.log('start new couurse page'.green, req.session.username,req.session.uid);
				if( req.session.uid.length < 12) res.send(404,{'msg':'user id is not valid'});
				else{
				    loadUserProfileById(req.session.uid,function(err,user){
				        if(err){return callback(err); }
				        else{
					        locals.user = {username: user.username,email: user.email,img:user.img};						
					    }
					    callback();
				    });
				}
			}else{
                callback();	
            }
		}],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
						locals.title = 'Start New Course Guide';
                        res.render('course_setting',locals);			
                    },
                    json: function(){
                        res.send(locals.courses);
                    }
                  });
	    });	
}

function startNewCourse(req,res,next){
	//console.log('retrieve logined page'.green, req.session.username,req.session.uid);
	console.log('startNewCourse '.green,req.body.title,req.body.description,req.body.city,req.body.tags);
	
	var errors = [];
    if (!req.body.title) errors.push("title unspecified")
    if (!req.body.description) errors.push("description unspecified")
    if (errors.length){
        res.statusCode = 400;
        res.end(JSON.stringify({status:"error", errors:errors}));      
        return;    
	}		
	
	var title,description,city,tags;
	if(req.body.title) { title = sanitize(req.body.title).trim(), title = sanitize(title).xss(); }
	if(req.body.description) { description = sanitize(req.body.description).trim(), description = sanitize(description).xss(); }
	if(req.body.city) { city =  sanitize(req.body.city).trim(), city = sanitize(city).xss(); }
	if(req.body.tags) { tags =  sanitize(req.body.tags).trim(), tags = sanitize(tags).xss(); }
	
	courseModel.createNewCourse({'title':title,'desc':description,'city':city,'tags':tags,'tutor.id':mongoose.Types.ObjectId(req.session.uid)},function(err,data){	
	    res.format({
                    html: function(){
					     console.log('getRecentCourses  html');
                         res.redirect('/course/'+data._id);
                    },
                    json: function(){
                         res.send(200);
                    }
        });	  
	});
}





function deleteCourse(req,res,next){

   console.log('delete Course ',req.params.id);
   if( req.params.id.length < 12) res.send(404,{'msg':'course id is not valid'});
   
   async.parallel([
		function(callback) {
            courseModel.deleteCourseById( req.params.id ,function(err,data){
                if(err) next(err);
	            else{
	                console.log('delete success'.green);
		            callback();
	            }	  
            }) 
		}      
   	],function(err) {
	      if (err) return next(err); 
	      res.format({
                    html: function(){
                         //res.render('course_setting',locals);		
                         res.redirect('/');						 
                    },
                    json: function(){
                         //res.send(locals.courses);
						 res.send(200);
                    }
                  });
	});	
}



function getCourseDetailOnQuestions(req,res,next){
    console.log('getCourseDetailOnQuestions',req.params.id);   
    var locals = {};

	async.parallel([
	    function(callback) {
		/*
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
        */
        callback();		
		}],function(err){
	      if (err) return next(err); 
/*		  
		  if(req.xhr){
		    res.send(locals.posts);
		    return;
		  }		  
*/		  console.log('questions');
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
				        if(err){return callback(err); }
				        else{
					        locals.user = {username: data.username,email: data.email, img:data.img};						
					    }
					    callback();
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


app.post('/course/:id/join',joinCourse);
app.post('/course/:id/disjoin',disJoinCourse);

function joinCourse(req,res,next){
   console.log('joinCourse',req.params.id);   
   var locals = {};

   courseModel.joinCourse(req.params.id,req.session.uid,function(err,course){
		if(err) {
		         console.log('course uid not found'.red,err);
		         next(err);
		}else{
			console.log('find courses'.green,course);
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
   courseModel.disJoinCourse(req.params.id,req.session.uid,function(err,course){
		if(err) {
		         console.log('course uid not found'.red,err);
		         next(err);
		}else{
			console.log('find courses'.green,course);
			res.redirect("/course/"+req.params.id);
        }    
   })
}

function belongToCourseGroup(){



}

