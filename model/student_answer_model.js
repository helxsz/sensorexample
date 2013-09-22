var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var answerSchema = new mongoose.Schema({
    sid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	qid: { type:mongoose.Schema.Types.ObjectId, ref: 'Question'},
    anw: [{ type: String}],
	debug:[{ type: String }]
});
 
var AnswerModel = mongoose.model('Answer',answerSchema);
exports.AnswerModel = AnswerModel; 

function addAnswerResultToQuestion( sid, qid, answer,debug,callback){
	var options = { upsert:true};		 //  new: true,
    console.log('addAnswerResultToQuestion model',debug);
	AnswerModel.update({'sid':sid,'qid':qid},{'$push':{'anw':answer,'debug':debug}},options,function(err,answer){
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, answer);
		}
	})

}

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

function removeAnswerResultByIndex(sid ,qid, index, callback){
			
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