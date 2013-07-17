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
var account_api = require('./account_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");





/******************************************************************

                    question model
					
*******************************************************************/
/***********************  user operation  *************************/
app.get('/course/:id/questions',getCourseDetailOnQuestions);
app.get('/course/:id/questions/:qid',getQuestionById);

//******************   admin operation   ***************************/
app.post('/course/:id/questions',postNewQuestion);
app.put('/course/:id/questions/:qid',editQuestionById);
app.del('/course/:id/questions/:qid',delQuestionById);
function getCourseDetailOnQuestions(req,res,next){
    console.log('getCourseDetailOnQuestions',req.params.id);   
    var locals = {};
	async.parallel([
	    function(callback) {
            courseModel.findCourseQuestionsById(req.params.id,function(err,data){
			    if(err) { next(err); callback();	}
	            else{
				    				    
					locals.student = false;
					locals.tutor = false;
					if(data.stud){
					//console.log(data.stud.length);
					 for(var i=0;i<data.stud.length;i++){				   
					    console.log(data.stud[i].username,data.stud[i].email,data.stud[i]._id);
						if(data.stud[i]._id==req.session.uid){
							locals.student = true;
							break;
						}					   
					 } 
					  locals.students = data.stud;
					}
					
					//if(req.session.uid == data.tutor.id) locals.tutor = true;
					
                    callback();	
				}
			})           
		}],function(err){
	      if (err) return next(err);
		  
		  
		  
          /*		  
	      res.format({
                    html: function(){
					     locals.page = 'questions';
					     console.log('getRecentCourses  html');
                         res.render('course_description', locals);
                    },
                    json: function(){
                         res.send(locals.students);
                    }
                  });
		  */
	    });	
}

function postNewQuestion(req,res,next){

	var errors = [];
    if (!req.body.description) errors.push("description unspecified")
    if (errors.length){
        res.statusCode = 400;
        res.end(JSON.stringify({status:"error", errors:errors}));      
        return;    
	}	
    
	var description,tip,solution,level,tags;
	if(req.body.description) { description = sanitize(req.body.description).trim(), description = sanitize(description).xss(); }
	if(req.body.tip) { tip = sanitize(req.body.tip).trim(), tip = sanitize(tip).xss(); }
	if(req.body.solution) { solution =  sanitize(req.body.solution).trim(), solution = sanitize(solution).xss(); }
	if(req.body.tags) { tags =  sanitize(req.body.tags).trim(), tags = sanitize(tags).xss(); }
	level = req.body.level;
	if(!req.session.uid) return res.send(404,{'error':'not authorized'})	
	console.log(description,"      ",tip,solution,"       ",tags,'    ',req.body.level);
	//console.log('start..'.green,req.body.date_start,"      ",req.body.date_end, moment(req.body.date_start, "DD-MM-YYYY"),moment(req.body.date_end, "DD-MM-YYYY"));
	
    questionModel.createNewQuestion( {
	                                    'que':description
	                                   ,'tip':tip
									   ,'sol':solution
	                                   ,'ans':2
									   ,'lev':level
									   ,'uid': mongoose.Types.ObjectId(req.session.uid)
									   ,'tags':tags.split(',')
									 },	
	function(err,data){
	    console.log('referer',req.referer);
	    //if(req.referer) res.redirect(req.referer);
		if(err){ next(err); return res.send(500,{"msg":"question added failed"}); }
		else{
		      console.log(data._id,'...................');
		      courseModel.addQuestion(req.params.id,data._id.toString(),function(err,data){
			      if(err) { next(err); return res.send(500,{"error":"question added failed"}); }
			      else{
				       res.send(200,{'msg':'update success'});
				  }			   
			   });
            			   
		}
	});
}

function editQuestionById(req,res,next){

    questionModel.updateQuestionById(req.params.id,{},function(err,data){
	    if(err) return next(err);
		else{
		
		     res.send(200);
		
		}
	})
}

function getQuestionById(req,res,next){

    questionModel.updateQuestionById(req.params.id,{},function(err,data){
	    if(err) return next(err);
		else{
		
		     res.send(200);
		
		}
	})
   
}

function delQuestionById(req,res,next){
   console.log('delete delQuestionById ');
   if( res.params.id.length < 12) res.send(404,{'msg':'course id is not valid'});   
   async.parallel([
		function(callback) {
            questionModel.deleteQuestionById( mongoose.Types.ObjectId(req.params.id) ,function(err,data){
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
					     console.log('getRecentCourses  html');
                         //res.render('course_setting',locals);	
                         res.send(200);						 
                    },
                    json: function(){
                         //res.send(locals.courses);
						 res.send(200);
                    }
                  });
	});	
    res.send(200);
}



/*
db.mycollection.find({"IMAGE URL":{$exists:true}});

db.mycollection.find({"IMAGE URL":{$ne:null}});
*/

/*	
var ObjectId = require('mongoose').Types.ObjectId;
var objId = new ObjectId( (param.length < 12) ? "123456789012" : param );
// You should make string 'param' as ObjectId type. To avoid exception, 
// the 'param' must consist of more than 12 characters.

User.find( { $or:[ {'_id':objId}, {'name':param}, {'nickname':param} ]}, 
  function(err,docs){
    if(!err) res.send(docs);
});	

db.inventory.update( { tags: { $in: ["appliances", "school"] } }, { $set: { sale:true } } )

*/


/**************************************************************

       course test user submit

***************************************************************/
var userQuizModel = require('../model/user_quiz_model');

app.get('/course/:id/test',getCourseTestPage);
app.post('/course/:id/test',submitCourseTest);
function getCourseTestPage(req,res,next){
    var locals = {};
    locals.title = 'test';
	console.log('getCourseTestPage  html',req.params.id);		
	async.parallel([
	    function(callback) {
            courseModel.findCourseQuestionsById(req.params.id,function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
				    locals.ques = data;
                    locals.course_id = req.params.id;					
                    callback();	
				}
			})           
		},
	    function(callback) {
            userQuizModel.findQuizByCIDAndUID(req.params.id, req.session.uid,function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
				    console.log('findQuizByCIDAndUID   ',data);				
                    callback();	
				}
			})           
		}		
		],function(err){
	      if (err) return next(err);		  
	      res.format({
                    html: function(){
					     //console.log('getCourseTestPage  html',locals);
                         res.render('course_test', locals);
                    },
                    json: function(){
                         res.send(locals.students);
                    }
                  });		  
	    });			
}

function submitCourseTest(req,res,next){

   

}
app.post('/course/:cid/test/:qid',userPostQuestion);

function userPostQuestion( req,res,next ){

    console.log(req.params.cid,req.params.qid, req.session.uid, req.body.content);
	
	if(!req.params.cid ||!req.params.qid || !req.session.uid){req.send(404);return};
	
	userQuizModel.updateAnswer3(req.params.cid,req.session.uid,req.params.qid,req.body.content,function(err,data){
	    if(err) { next(err);  }
		else if(data==null){
		    console.log('userPostQuestion  insert question');
			//var data = new userQuizModel();
			res.send(200);
		}else{
		    console.log('userPostQuestion  update success',data);
		    res.send(200,data);
		    
		}
	
	});
   
}