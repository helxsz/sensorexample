var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/*  https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes
  question sequence { 'milestone':{goal,[questions]}, 'mile stone':{ goal, [questions]}}
                                        {questionid,answer,question}
*/
var studentPlanSchema = new mongoose.Schema({
    cid: [{ type: ObjectId, ref: 'Course' }],
	sid: [{ type: ObjectId, ref: 'User' }],
	plan:[   Milestone  ],
	count: {
          	m_all:Number ,m_now:Number,  // all milestones, now milestones
	        q_all:Number , q_now:Number  // all questions, now questions
	}
});

var Milestone = mongoose.Schema({ goal:String,ques: [ { type: ObjectId, ref: 'Question' } ], anws: [ String ] ,lock:{type:Boolean, default:true},fin_time:Date   });

var StudentPlanModel = mongoose.model('StudentPlan',studentPlanSchema);
exports.StudentPlanModel = StudentPlanModel; 

function createStudentPlan(cid,sid,callback){

	StudentPlanModel.create({'cid':cid,'sid':sid},function(err,docs){
		if(err) {
			console.log('err ');
			callback(err, null);
		}
		else {
			callback(null, docs);
		}
	})
}

/*  [{'goal':'goal'},{'goal':'goal2'},{'goal':'goal3'}]  */
function createPlanAndAddMilestone(cid,sid,goals,callback){
 	var options = { upsert: true };
	// {'$addToSet':{'plan':{'goal':goal}},'$inc':{'count.m_all':1}}
   	StudentPlanModel.update({'cid':cid,'sid':sid},{'$push':{'plan':{'$each':goals}}},options,function(err,docs){
		if(err) {
			console.log('createPlanAndAddMilestone err '.red);
			callback(err, null);
		}
		else {
			callback(null, docs);
		}
	})
}

exports.createStudentPlan = createStudentPlan;
exports.createPlanAndAddMilestone = createPlanAndAddMilestone;

// copy the default plan to the user
function copyPlan(cid,sid, plan, callback){

    var options = { upsert:true};  //,'count':plan.count
	StudentPlanModel.update({'sid':sid,'cid':cid},{'$set':{'plan':plan.plan, 'count.m_all': plan.count.m_all, 'count.q_all':plan.count.q_all, 'count.m_now':0, 'count.q_now':0}},options,function(err,doc){
		if(err) {
			callback(err, null);
		}
		else {
				callback(null, doc);			
		}
	})
}


function updateStudentPlans(cid, sid, milestone, question,callback){
	StudentPlanModel.update({'sid':sid,'cid':cid},{'$inc':{'count.m_now':milestone,'count.q_now':question}},function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

function finishMilestone(cid,sid,goal,callback){
 	var options = { new: false ,select:'_id'};	
	StudentPlanModel.update({'cid':cid,'sid':sid, 'plan.goal':goal},{'$set':{'plan.$.lock':false,'plan.$.fin_date':new Date()}},options,function(err,ref){
		if(err) {
			console.log('finishMilestone'.red,err);
			callback(err, null);
		}else{
			console.log('finishMilestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}
exports.finishMilestone = finishMilestone;
exports.updateStudentPlans =updateStudentPlans;




function getOneStudentPlan(cid,sid,callback){
	StudentPlanModel.findOne({'sid':sid,'cid':cid},'plan count',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}


function getOneStudentPlanWithQuestion(cid,sid, callback){
	StudentPlanModel.findOne({'cid':cid,'sid':sid},'plan count plan.ques').populate({path:'plan.ques',select:'que'}).exec(function (err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}
exports.getOneStudentPlanWithQuestion = getOneStudentPlanWithQuestion;

exports.copyPlan = copyPlan;
exports.getOneStudentPlan =getOneStudentPlan;


/*************************************************************

**************************************************************/
function addMilestone2(cid, sid ,goal,callback){	
 	var options = { new: false ,select:'_id'};	
	// {'_id':plan_id},{'$push':{'plan':{'$each':goals}}}
	StudentPlanModel.update({'cid':cid,'sid':sid},{'$addToSet':{'plan':{'goal':goal}},'$inc':{'count.m_all':1}},options,function(err,ref){
		if(err) {
			console.log('addMilestone'.red,err);
			callback(err, null);
		}else{
			console.log('addMilestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}

function removeMilestone2(cid,sid, goal,callback){
 	var options = { new: false ,select:'_id'};	
	StudentPlanModel.update({'cid':cid, 'sid':sid},{'$pull':{'plan':{'goal':goal}},'$inc':{'count.m_all':-1}},options,function(err,ref){
		if(err) {
			console.log('removeMilestone'.red,err);
			callback(err, null);
		}else{
			console.log('removeMilestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}

function getMilestones2(cid,sid, callback){
	StudentPlanModel.findOne({'cid':cid,'sid':sid},'plan count plan.ques',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}




exports.addMilestone2 = addMilestone2;
exports.removeMilestone2 = removeMilestone2;
exports.getMilestones2 = getMilestones2;



function getMilestonesByCourseAndTutor(cid,sid, callback){
	StudentPlanModel.findOne({'cid':cid,'sid':sid},'plan count plan.ques',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}
exports.getMilestonesByCourseAndTutor = getMilestonesByCourseAndTutor;
/**************************************************************
           add questions to milestone

***************************************************************/
/*
//  findbyid
function getQuestionsByMilestone(sid,name, callback){
	StudentPlanModel.findById(id).populate('q').exec(function(err, posts) { 
		if(err){callback(err, null);}
		else{
			console.log("findCoursePostsById".green,posts.length);
			callback(null, posts);
		}	   
	})

}
exports.getQuestionsByMilestone = getQuestionsByMilestone;
*/
exports.getQuestionsByNumber2 =getQuestionsByNumber2;
exports.addQuestionToMilestone2 = addQuestionToMilestone2;
exports.removeQuestionFromMilestone2 = removeQuestionFromMilestone2;
function getQuestionsByNumber2(cid,sid, number, callback){
    //http://stackoverflow.com/questions/5562485/get-particular-element-from-mongodb-array
	// http://stackoverflow.com/questions/3985214/mongodb-extract-only-the-selected-item-in-array
	number = Number(number);
	//StudentPlanModel.findOne({'_id':pid,'plan':{ '$elemMatch': { 'goal': number } } },'plan.ques',function(err, doc){
	StudentPlanModel.findOne({'cid':cid,'sid':sid },{ 'plan':{ $slice: [ number, 1 ] }, 'plan.ques':1,'plan.goal':1 },function(err, doc){
	//StudentPlanModel.findOne({'_id':pid },{ 'plan':{ $slice: [ number, 1 ] }, 'plan.ques':1,'plan.goal':1 }).populate('plan.ques', 'que tip').exec( function(err, doc){
    	if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

function addQuestionToMilestone2(cid, sid ,number, questions,callback){	
 	var options = { new: false ,select:'_id'};	
	//http://stackoverflow.com/questions/4121666/updating-nested-arrays-in-mongodb
	//db.objects.update({'items.2': {$exists:true} }, {'$set': {'items.2.blocks.0.txt': 'hi'}})
	// http://docs.mongodb.org/manual/reference/operator/positional/
	
	//findOneAndUpdate
	StudentPlanModel.update({'cid':cid,'sid':sid, 'plan.goal':number},{'$addToSet':{'plan.$.ques':{ '$each': questions}},'$inc':{'count.q_all':1}},options,function(err,ref){
		if(err) {
			console.log('add question to Milestone'.red,err);
			callback(err, null);
		}else{
			console.log('add question to Milestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}




function removeQuestionFromMilestone2(cid, sid,number, questionId,callback){
 	var options = { new: false ,select:'_id'};	
	//http://stackoverflow.com/questions/4121666/updating-nested-arrays-in-mongodb
	//db.objects.update({'items.2': {$exists:true} }, {'$set': {'items.2.blocks.0.txt': 'hi'}})
	// http://docs.mongodb.org/manual/reference/operator/positional/
	
	StudentPlanModel.update({'cid':cid,'sid':sid, 'plan.goal':number},{'$pull':{'plan.$.ques':questionId},'$inc':{'count.q_all':-1}},options,function(err,ref){
		if(err) {
			console.log('add question to Milestone'.red,err);
			callback(err, null);
		}else{
			console.log('add question to Milestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}

/*
exports.getQuestionsByNumber = getQuestionsByNumber;
exports.addQuestionToMilestone = addQuestionToMilestone;
exports.removeQuestionFromMilestone = removeQuestionFromMilestone;

function getQuestionsByNumber(pid, number, callback){
    //http://stackoverflow.com/questions/5562485/get-particular-element-from-mongodb-array
	// http://stackoverflow.com/questions/3985214/mongodb-extract-only-the-selected-item-in-array
	number = Number(number);
	//StudentPlanModel.findOne({'_id':pid,'plan':{ '$elemMatch': { 'goal': number } } },'plan.ques',function(err, doc){
	StudentPlanModel.findOne({'_id':pid },{ 'plan':{ $slice: [ number, 1 ] }, 'plan.ques':1,'plan.goal':1 },function(err, doc){
	//StudentPlanModel.findOne({'_id':pid },{ 'plan':{ $slice: [ number, 1 ] }, 'plan.ques':1,'plan.goal':1 }).populate('plan.ques', 'que tip').exec( function(err, doc){
    	if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})

}

// https://github.com/LearnBoost/mongoose/wiki/3.6-Release-Notes  populate
function addQuestionToMilestone(pid,number, questions,callback){
	
 	var options = { new: false ,select:'_id'};	
	//http://stackoverflow.com/questions/4121666/updating-nested-arrays-in-mongodb
	//db.objects.update({'items.2': {$exists:true} }, {'$set': {'items.2.blocks.0.txt': 'hi'}})
	// http://docs.mongodb.org/manual/reference/operator/positional/
	
	//findOneAndUpdate
	StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$addToSet':{'plan.$.ques':{ '$each': questions}},'$inc':{'count.q_all':1}},options,function(err,ref){
		if(err) {
			console.log('add question to Milestone'.red,err);
			callback(err, null);
		}else{
			console.log('add question to Milestone'.green+ref);				  
		    callback(null,ref);
		}
	})

}

function removeQuestionFromMilestone(pid,number, questionId,callback){
 	var options = { new: false ,select:'_id'};	
	//http://stackoverflow.com/questions/4121666/updating-nested-arrays-in-mongodb
	//db.objects.update({'items.2': {$exists:true} }, {'$set': {'items.2.blocks.0.txt': 'hi'}})
	// http://docs.mongodb.org/manual/reference/operator/positional/
	
	StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$pull':{'plan.$.ques':questionId},'$inc':{'count.q_all':-1}},options,function(err,ref){
		if(err) {
			console.log('add question to Milestone'.red,err);
			callback(err, null);
		}else{
			console.log('add question to Milestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}
*/
/************************************
            answer the question  still not working


function addAnswerToQuestion(pid,number, questionId,answers,callback){
 	var options = { new: false ,select:'_id'};	
	// $addToSet: { <field>: { $each: [ <value1>, <value2> ... ] } }
	//findOneAndUpdate
	StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$addToSet':{'plan.$.anws':{ '$each': answers}} },options,function(err,ref){
		if(err) {
			console.log('add answer to Question'.red,err);
			callback(err, null);
		}else{
			console.log('add answer to Question'.green+ref);				  
		    callback(null,ref);
		}
	})

}

function editAnswerToQuestion(sid,number, questionId,answer,callback){


}
exports.addAnswerToQuestion = addAnswerToQuestion;
*************************************/

/*
function addMilestone(plan_id,goal,callback){
	
 	var options = { new: false ,select:'_id'};	
	// {'_id':plan_id},{'$push':{'plan':{'$each':goals}}}
	StudentPlanModel.update({'_id':plan_id},{'$addToSet':{'plan':{'goal':goal}},'$inc':{'count.m_all':1}},options,function(err,ref){
		if(err) {
			console.log('addMilestone'.red,err);
			callback(err, null);
		}else{
			console.log('addMilestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}

function removeMilestone(plan_id, goal,callback){
 	var options = { new: false ,select:'_id'};	
	StudentPlanModel.update({'_id':plan_id},{'$pull':{'plan':{'goal':goal}},'$inc':{'count.m_all':-1}},options,function(err,ref){
		if(err) {
			console.log('removeMilestone'.red,err);
			callback(err, null);
		}else{
			console.log('removeMilestone'.green+ref);				  
		    callback(null,ref);
		}
	})
}

function getMilestones(plan_id, callback){
	StudentPlanModel.findById(plan_id,'plan count plan.ques',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})

}



exports.addMilestone = addMilestone; 
exports.getMilestones = getMilestones;
exports.removeMilestone = removeMilestone;
*/
