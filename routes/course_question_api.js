var async = require('async'),
    fs = require('fs'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment'),
	mongoose = require('mongoose');

	
var app = require('../app').app,
    mongoose = require('../app').mongoose,
    account_api = require('./account_api'),
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    questionModel = require('../model/question_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js');  	

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
            courseModel.findCourseQuestionsById(req.params.id,'que _id',function(err,data){
			    if(err) { next(err); callback();	}
	            else{				    				    
                    locals.questions = data;	
                    console.log(data);					
                    callback();	
				}
			})           
		}],function(err){
	        if (err) return next(err);
		    //console.log(req.accepted);
			
			if(req.accepts('application/json')){	
                console.log("'application/json'");			
			    res.json(200,locals.questions);
			}
			else if(req.accepts('text/html')){
			    console.log("accepts('text/html')");
				locals.page = 'posts';					
                res.render('course/course_page_questions.ejs', locals.questions);
			}
             		  
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
	                                   //,'ans':2
									   //,'lev':level
									   ,'uid': mongoose.Types.ObjectId(req.session.uid)
									   //,'tags':tags.split(',')
									 },	
	function(err,question_data){
	    //console.log('referer',req.referer);
	    //if(req.referer) res.redirect(req.referer);
		if(err){ next(err); return res.send(500,{"msg":"question added failed"}); }
		else{
		      console.log(question_data._id,'...................',question_data);
		      courseModel.addQuestion(req.params.id,question_data._id.toString(),function(err,data){
			      if(err) { next(err); return res.send(500,{"error":"question added failed"}); }
			      else{
				       res.send(200,{'msg':'update success','question_id':question_data._id});
				  }			   
			   });
            			   
		}
	});
}

function editQuestionById(req,res,next){
    var qid = req.params.id;
    questionModel.updateQuestionById(qid,{},function(err,data){
	    if(err) return next(err);
		else{
		
		     res.send(200);
		
		}
	})
}

function getQuestionById(req,res,next){
    var cid = req.params.id, qid = req.params.qid;
    console.log('getQuestionById  ',qid);
    questionModel.findQuestionById(qid,{},function(err,data){
	    if(err) return next(err);
		else{
		     console.log('getQuestionById  ',data);
		     res.send(200,data);		
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


