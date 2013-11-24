var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
////////////////////////////////////////////////////////////////////////////////

var QuestionSchema = mongoose.Schema({ 
                               que: { type:String }                                    									                               
							  ,opt:[ String ]
							  ,tip:{ type:String }
							  ,sol:{ type:String }
							  ,ans:{ type:String }
                              // new properties
                              ,tags: [String]
							  ,lev:{ type: Number,  default: 0 }// 0 - 3
							  /////////////////////////////////////////////////////////
                              // date
                              ,c_date:Date
                              ,m_date:Date
							  ,lang:{type:String, "default":'en'}
							  // author
                              ,uid:ObjectId
							  // addtional
                              ,fork:ObjectId
                              ,src:[ String ]
                              ,pub:{type:Boolean,default:true}						  
});
  //{'type':0,'level':0,'question':'1 is what?', 'answer':'1',tags:['foo']}

QuestionSchema.pre('save', function(next) {
    var user = this;
    if (this.isNew)
    this.cdate = Date.now();
    else
    this.mdate = Date.now();  		
    next();
});
  
  
  
var QuestionModel = mongoose.model('Question',QuestionSchema);
exports.QuestionModel = QuestionModel;

function createNewQuestion(data,callback){
	console.log(data);
	QuestionModel.create(data,function(err,docs){
		if(err) {
			console.log('err '+err);
			callback(err, null);
		}
		else {
			console.log('insert   '+docs.length);
			callback(null, docs);
		}
	})	
}


function findQuestions(condition,option,callback){

	QuestionModel.find(condition,'que tip tags lev opt',option, function(err, docs){
		   if(err){ callback(err, null); } //
		   else
		   {
			   docs.forEach(function(doc){
				   console.log("each Questions     "+doc.que+"   "+doc.ans+"    "+doc.tip );
			   });
			   callback(err,docs);
		   }
	});
}

function findQuestionsInGroup(group,fields,option,callback){

	QuestionModel.find({ '_id': { $in: group } },fields,option, function(err, docs){
		   if(err){ callback(err, null); } //
		   else
		   {
		       //console.log(docs);
			   docs.forEach(function(doc){
				   console.log("each Questions     "+ doc._id + doc.que+"   "+doc.tip );
			   });
			   callback(err,docs);
		   }
	});
}

function findQuestionById(qid,option,callback){
    var qid;
	QuestionModel.findById(qid,'que tip tags lev opt',function(err, doc){
		if(err){callback(err, null);}
		else{
			//console.log("findQuestionById".green,qid);
			callback(null, doc);
		}
	})	
}

function findQuestionByQuery(condition,callback){
	QuestionModel.findOne(condition,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function updateQuestion(qid,update,callback){
	var options = { new: false };	
    var qid;
    try {
         qid = mongoose.Types.ObjectId(qid);
    } catch(e) {
        return callback(err, null);
    }

	QuestionModel.findOneAndUpdate({'_id':qid},update,options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})	
}


function deleteQuestion(qid,callback){
    var qid;
    try {
         qid = mongoose.Types.ObjectId(qid);
    } catch(e) {
        return callback(err, null);
    }

	if(QuestionModel){
		QuestionModel.findByIdAndRemove(qid,function(err){
			  if(err){console.log('err remove');callback(err, null);}	
			  else {
				  console.log('remove good ');
				  callback(null);
			  }
		});
	}
}

exports.createNewQuestion = createNewQuestion;
exports.findQuestions =findQuestions;
exports.findQuestionById = findQuestionById;
exports.findQuestionByQuery = findQuestionByQuery;
exports.findQuestionsInGroup = findQuestionsInGroup;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
