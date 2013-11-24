var async = require('async'),
    fs = require('fs'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment');

var app = require('../app').app,
    permissionAPI = require('./permission_api'),
    notifyAPI = require('./notification_api'),
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    questionModel = require('../model/question_model'),
    helpModel = require('../model/help_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js'); 


app.post('/course/:id/help',permissionAPI.authUser, permissionAPI.authStudentInCourse, callTutorForHelp);
app.get('/course/:id/help',permissionAPI.authUser, permissionAPI.authStudentInCourse, getHelpInfoOnQuestion);

function callTutorForHelp(req,res,next){
   var course_id = req.params.id, student_id = req.session.uid;
   
   var tutor_id = req.body.tutor_id, question_id = req.body.question_id, msg = req.body.msg;
   
   console.log('callTutorForHlep ','cid',course_id,'uid',student_id, 'qid',question_id, 'msg',msg);
   //course_id = "520db60a8932d7700f000001";
   //student_id = course_id; tutor_id = course_id; question_id = course_id, msg="ehloafa";
   var createNew = req.query.new, role=req.query.role;
   /*
   if(createNew=='1'){   
      helpModel.createNewHelp( { 'course':course_id,'user':student_id,'question':question_id },function(err,plan){
        if(err) next(err);
        else {
		    console.log('',plan);
            if(plan){
                helpModel.updateHelp( { '_id':plan._id},{'$push':{'chats':{'t':new Date().getTime(),'m':msg,'r':0}}},function(err,update){
                     if(err) next(err);
                     else {
		                 console.log('',update);  
                         if(update == 1){
						    res.send(200,{ "meta": { "code": 200} });
						 }else{
						    res.send(404,{ "meta": { "code": 404} });
						 }						 
		             }
                })		   
            }		   		   
		}
     })
   }else{        
   }
   */
   
	    var tutorID;
	    async.series([
            function(callback) {	        
	             courseModel.findCourseById2(course_id,'tutor',function(err,data){
				    if(err) console.log('error ',err);
				    else {
					    console.log('tutor is '.green,data.tutor.id);
						tutorID = data.tutor.id;
					}
					callback();
				 })        		
		    },	
		    function(callback) {
	             if(tutorID)  notifyAPI.notifyTutorOnHelp(tutorID,student_id, question_id,msg);	        		
                 callback();		    
		    }
		],function(err) {		
            		
	    });   
   
        helpModel.updateHelp( { 'course':course_id,'user':student_id,'question':question_id },{'$push':{'chats':{'t':new Date().getTime(),'m':msg, 'r':role}}},function(err,update){
            if(err) next(err);
            else {
		        console.log('',update);  
                if(update == 1){
					res.send(200,{ "meta": { "code": 200} });
				}else{
					res.send(404,{ "meta": { "code": 404} });
				}						 
		    }
        })   
}

function getHelpInfoOnQuestion(req,res,next){
    var course_id = req.params.id, student_id = req.session.uid;
	var question_id = req.query.question;
    console.log('callTutorForHlep',course_id,student_id, question_id );
	if(question_id!=null){
        helpModel.findHelpByQuery({ 'course':course_id,'user':student_id,'question':question_id },function(err,data){
            if(err) next(err);
            else {
		        console.log('findHelpByQuery',data);
                if(data == null){
		            res.send(404,{ "meta": { "code": 404} });
		        }else{
		            res.send(200,{ "data":data.chats });
		        }
		    }
       })
	}else {
        helpModel.findHelpsByQuery({ 'course':course_id,'user':student_id },function(err,data){
            if(err) next(err);
            else {
		        console.log('findHelpByQuerys',data);
                if(data == null){
		            res.send(404,{ "meta": { "code": 404} });
		        }else{
		            res.send(200,{ "data":data });
		        }
		    }
       })	    
	}
}




 
/*   Model 1
helpModel.findHelpByQuery({ 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001','question':'520db60a8932d7700f000001' },function(err,plan){
        if(err) next(err);
        else {
		   console.log('findHelpByQuery',plan);
           if(plan == null){
		   
		   }
		}
})		   

                helpModel.updateHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001','question':'520db60a8932d7700f000002' },{'$push':{'chats':{'t':new Date().getTime(),'m':'1111'}}},function(err,plan){
                     if(err) next(err);
                     else {
		                 console.log('',plan);   
		             }
                })

*/				
				
				
				
/*
   helpModel.createNewHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001','question':'520db60a8932d7700f000002' },function(err,plan){
        if(err) next(err);
        else {
		    console.log('',plan);
            if(plan){
                helpModel.updateHelp( { '_id':plan._id},{'$push':{'chats':{'t':new Date().getTime(),'m':'dfd'}}},function(err,plan){
                     if(err) next(err);
                     else {
		                 console.log('',plan);   
		             }
                })		   
            }		   		   
		}
   })		   
*/		   
		   



/*  Model 2
   helpModel.createNewHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' },function(err,plan){
        if(err) console.log(err);
        else {
		   console.log('',plan);
		   
		   
   helpModel.updateHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001'},{'$push':{'history.chat':{'t':new Date().getTime(),'m':'dfd'}},'$set':{'history.qid':'520db60a8932d7700f000001'}},function(err,plan){
        if(err) console.log(err);
        else {
		   console.log('',plan);
           
		}
   })
   
   
		}
   })
*/


/*   Model 3 test
helpModel.findHelpByQuery({ 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' },function(err,plan){
        if(err) next(err);
        else {
		   console.log('findHelpByQuery',plan);

		}
   })

   helpModel.updateHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' ,'history.qid':'520db60a8932d7700f000001'},{'$push':{'history.$.chat':{'t':new Date().getTime(),'m':'dfd'}}},function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);
           
		}
   })


   helpModel.createNewHelp( { 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' },function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);

		}
   })




   helpModel.updateHelp({ 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' },{'$push':{'chats':{'t':new Date(),'m':'wewe','qid':'520db60a8932d7700f000001' }}},function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);

		}
   })
   
    helpModel.updateHelp({ 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001' },{'$push':{'chats':{'t':new Date(),'m':'wewe','qid':'520db60a8932d7700f000002' }}},function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);

		}
   }) 

helpModel.findHelpByQuery({ 'course':'520db60a8932d7700f000001','user':'520db60a8932d7700f000001','tutor':'520db60a8932d7700f000001','chats.qid':'520db60a8932d7700f000001' },function(err,plan){
        if(err) next(err);
        else {
		   console.log('',plan);

		}
   })   
*/