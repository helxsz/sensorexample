var mongoose = require('../app').mongoose;
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
	},
	title: String
});

var Milestone = mongoose.Schema({ goal:String,ques: [ { type: ObjectId, ref: 'Question' } ], anws: [ String ]    });

var StudentPlanModel = mongoose.model('StudentPlan',studentPlanSchema);
exports.StudentPlanModel = StudentPlanModel; 

function createStudentPlan(cid,sid,callback){
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
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

    var options = { upsert:true};
	StudentPlanModel.update({'sid':sid,'cid':cid},{'$set':plan},options,function(err,doc){
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, doc);
		}
	})
}

function getStudentPlans(sid,callback){
    try {
         sid = mongoose.Types.ObjectId(sid);
    } catch(e) {
        return callback(e, null);
    }
	StudentPlanModel.find({'sid':sid},'count plan sid city cid',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

function getOneStudentPlan(cid,sid,callback){

	StudentPlanModel.findOne({'sid':sid,'cid':cid},'plan count plan.ques',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

exports.copyPlan = copyPlan;
exports.getStudentPlans = getStudentPlans;
exports.getOneStudentPlan =getOneStudentPlan;


/*************************************************************

**************************************************************/


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

/************************************
            answer the question 
*************************************/

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