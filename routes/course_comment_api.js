var async = require('async'),
    fs = require('fs'),
    colors = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),	
    moment = require('moment');

var app = require('../app').app,
	notification_api = require('./notification_api'),
    courseModel = require('../model/course_model'),
    courseLikeModel = require('../model/course_like_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js');	
	
/*****************************************************************
       comment for the course
	   

*****************************************************************/

app.get('/course/:id/comments',getCourseDetailOnComments);
app.post('/course/:id/comments',postCommentOnCourse);
app.del('/course/:id/comments/:cid',delCommentOnCourse);

function getCourseDetailOnComments(req,res,next){
    console.log('getCourseDetailOnComments fuck',req.params.id);   
    var skip = (req.query["s"])?req.query["s"]:0, limit = (req.query["l"])?req.query["l"]:50, option = {'skip':skip,'limit':limit};
	
    var locals = {};
	async.parallel([
	    function(callback) {
			if(req.session.uid){
			   locals.user = {'username':req.session.username};
			}		    //, sort:{'com.date': 1}
            courseModel.findCourseCommentsById(req.params.id,{skip:0, limit:12},function(err,data){
			    if(err) { next(err); callback();	}
	            else{
				    console.log('comments',data.com.length);
					

					locals.comments = data.com;
                    callback();	
				}
			})
				
		}],function(err){
	      if (err) return next(err);
/*
		  if(req.xhr){
		    res.send(locals.comments);
		    return;
		  }		  
*/		  
	      res.format({
		        
                    html: function(){
					     locals.page = 'comment';
					     //console.log('getCourseDetailOnComments  html',locals.comments[0].name);
                         res.render('course/course_page_comments.ejs', locals);
                    },	
					
                    json: function(){
                         res.send(locals.students);
                    }
                  });
	    });	
}

function postCommentOnCourse(req,res,next){
     console.log(req.params.id,req.body.msg,req.body.name,req.body.img);
	 /**/
	 courseModel.addComment(req.params.id,req.session.username,req.body.img,req.body.msg, function(err,data){
	    if(err) next(err);
	    else res.send(200,{'img':req.body.img,'username':req.session.username,'msg':req.body.msg});  //,'time':moment().startOf('hour').fromNow()

	 });
	 
}

function delCommentOnCourse(req,res,next){
    console.log(req.params.id,req.params.cid);
    res.send(200);
}


// Middleware  moderators  admin
var requireLogin = function(role) {
  return function(req, res, next) {
    if(req.session.uid){
		next();
	}else{
	    res.redirect('/login');
	}	
  }
};


