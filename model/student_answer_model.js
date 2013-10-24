var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var answerSchema = new mongoose.Schema({
    sid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	qid: { type:mongoose.Schema.Types.ObjectId, ref: 'Question'},
    anw: [{ type: String}],
	debug:[{ type: String }],
	verified: { type: Boolean, default:false },
	right:{type:Boolean, default:false}
});
 
var AnswerModel = mongoose.model('Answer',answerSchema);
exports.AnswerModel = AnswerModel; 
answerSchema.index({ sid: 1, qid: 1 });

function addAnswerResultToQuestion( sid, qid, answer,debug,callback){
	var options = { upsert:true};		 //  new: true,
    //console.log('addAnswerResultToQuestion model',debug);
	// http://docs.mongodb.org/manual/tutorial/limit-number-of-elements-in-updated-array/  
    // http://blog.mongodb.org/post/58782996153/push-to-sorted-array	
	//,$slice: -3
	AnswerModel.update({'sid':sid,'qid':qid},{'$push':{'anw':answer,'debug':debug}},options,function(err,answer){
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, answer);
		}
	})
}


function verifyAnswer(sid, qid, right,callback){
    
	AnswerModel.update({'sid':sid,'qid':qid},{'$set':{'verified':true,'right':right}},function(err,answer){
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, answer);
		}
	})
}

/*
function verifyAnswers(sid, qid, right){   
	AnswerModel.update({'sid':sid,'qid':qid},{'$set':{'verified':true,'right':right}},function(err,answer){
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, answer);
		}
	})
}
exports.verifyAnswers = verifyAnswers;
*/

exports.verifyAnswer = verifyAnswer;


function removeAnswerResultToQuestion(sid ,qid,callback){
			
	/*	$ne:self._id */
	AnswerModel.remove({'sid':sid,'qid':qid},function(err,ref){
		if(err) {
			callback(err, null);
		}else{
			//console.log('follow  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

// http://docs.mongodb.org/manual/reference/operator/pull/

function removeAnswerResultByIndex(sid ,qid, index, callback){
	/*  solution   // http://stackoverflow.com/questions/4588303/in-mongodb-how-do-you-remove-an-array-element-by-its-index
        db.lists.update({}, {$unset : {"interests.3" : 1 }})
        db.lists.update({}, {$pull : {"interests" : null}})
    */	
	/*	$ne:self._id */
	var a = 'anw.'+index, b = 'debug.'+index;
	//AnswerModel.update({'sid':sid,'qid':qid},{'$pull':{a:1,b:1}},function(err,ref){
	//AnswerModel.update({'sid':sid,'qid':qid},{'$pull':{'anw.0':1,'debug.0':1}},function(err,ref){
	AnswerModel.update({'sid':sid,'qid':qid},{'$pull':{'anw.$.0':1,'debug.$.0':1}},function(err,ref){
		if(err) {
			callback(err, null);
		}else{
			console.log('removeAnswerResultByIndex  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

function getAnswerResultsOnQuestion(sid, qid,callback){

	AnswerModel.findOne({'sid':sid,'qid':qid},'anw debug',function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})

}

exports.addAnswerResultToQuestion = addAnswerResultToQuestion;
exports.removeAnswerResultToQuestion = removeAnswerResultToQuestion;
exports.getAnswerResultsOnQuestion = getAnswerResultsOnQuestion;  
exports.removeAnswerResultByIndex = removeAnswerResultByIndex;

function getAnswersInGroup(sid, qidGroup, fields, callback){  //'anw debug'

	AnswerModel.find({'sid':sid,'qid': { $in: qidGroup }},fields,function(err,ref){ //aws
	//AnswerModel.find({'sid':sid,'qid': { $in: qidGroup }},fields).populate({path:'qid',select:'que'}).exec(function (err, ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
}
exports.getAnswersInGroup = getAnswersInGroup;



