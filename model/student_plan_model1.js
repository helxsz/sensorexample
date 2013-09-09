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
	}
});

var Milestone = mongoose.Schema({    goal:String,ques: [  { q:{ type: ObjectId, ref: 'Question' }, a:String } ]    });

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

	StudentPlanModel.findOne({'sid':sid,'cid':cid},'count plan sid city cid',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

exports.createStudentPlan = createStudentPlan;
exports.getStudentPlans = getStudentPlans;
exports.getOneStudentPlan =getOneStudentPlan;


/*************************************************************

**************************************************************/
function addMilestone(plan_id,goal,callback){
	
 	var options = { new: false ,select:'_id'};	
	// {'_id':plan_id},{'$push':{'plan':{'$each':goals}}}
	StudentPlanModel.update({'_id':plan_id},{'$addToSet':{'plan':{'goal':goal}}},options,function(err,ref){
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
	StudentPlanModel.update({'_id':plan_id},{'$pull':{'plan':{'goal':goal}}},options,function(err,ref){
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
	StudentPlanModel.findById(plan_id,'plan count',function(err, doc){
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
	
	//StudentPlanModel.findOne({'_id':pid,'plan.goal': number },'plan.ques',function(err, doc){
	StudentPlanModel.findOne({'_id':pid,'plan':{ '$elemMatch': { 'goal': number } } },'plan.ques',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})

}


function addQuestionToMilestone(pid,number, questionsId,callback){
	
 	var options = { new: false ,select:'_id'};	
	//http://stackoverflow.com/questions/4121666/updating-nested-arrays-in-mongodb
	//db.objects.update({'items.2': {$exists:true} }, {'$set': {'items.2.blocks.0.txt': 'hi'}})
	// http://docs.mongodb.org/manual/reference/operator/positional/
	
	//findOneAndUpdate
	StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$push':{'plan.$.ques':{'q':questionsId}}},options,function(err,ref){
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
	
	//StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$pull':{'plan.$.ques':questionId}},options,function(err,ref){
	//findOneAndUpdate
	//StudentPlanModel.update({'_id':pid,'plan.goal':number},{'$pull':{'plan.$.ques.q':questionId}},options,function(err,ref){
	//StudentPlanModel.update({'_id':pid,'plan.goal':number,'plan.ques.q':questionId},{'$set':{'plan.$.ques.q':null}},options,function(err,ref){
	StudentPlanModel.update({'_id':pid,'plan.goal':number,'plan.ques.q':questionId},{'$pull':{'plan.ques.$.q':questionId}},options,function(err,ref){
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

function addAnswerToQuestion(pid,number, questionId,answer,callback){
 	var options = { new: false ,select:'_id'};	
	
	//findOneAndUpdate
	StudentPlanModel.update({'_id':pid,'plan.goal':number,'plan.$.ques.$.q':questionId},{'$set':{'plan.ques.q':{'a':answer}}},options,function(err,ref){
		if(err) {
			console.log('add answer to Milestone'.red,err);
			callback(err, null);
		}else{
			console.log('add answer to Milestone'.green+ref);				  
		    callback(null,ref);
		}
	})

}

function editAnswerToQuestion(sid,number, questionId,answer,callback){


}
exports.addAnswerToQuestion = addAnswerToQuestion;