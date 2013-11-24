var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
///////////////////////////////////////////////////////////////////////////////

var UserQuizSchema = mongoose.Schema({	 
		 // user and test are unique  required: true,index:true
		uid:{type:ObjectId,ref: 'User'},
		cid:{type:ObjectId,ref: 'Course'},
		 //{ type: ObjectId, ref: 'Question' }
		answ:[   new mongoose.Schema({con:String, qid:ObjectId, time:Date}, {_id:false})    ],  //
		//answ: [  { type: ObjectId, ref: 'Question' } ],   //  {con: String, qid: ObjectId, time: Date} 
		
		stat:{ 
		        score:Number,
		        num_r:Number,num_w:Number,num_n:Number,
				time:Number
		},
		
		s_date:Date,
		e_date:Date,
		
		c_date:Date,
		m_date:Date,/**/
        fin:{type:Boolean,default:false}		
});
var UserQuizModel = mongoose.model('UserQuiz',UserQuizSchema);
exports.UserQuizModel = UserQuizModel;

/**
    middleware
*/

UserQuizSchema.pre('save', function(next) {
    var quiz = this;

    if (this.isNew){
        this.cdate = Date.now();
	}
    else
        this.mdate = Date.now();  		
    next();
});


function createQuiz(data,callback){
	UserQuizModel.create(data,function(err,docs){
		if(err) {
			console.log('err ');
			callback(err, null);
		}
		else {
			console.log('insert   '+docs.length);
			callback(null, docs);
		}
	})	
}

function findQuizByCIDAndUID(cid,uid,callback){
    var cid = mongoose.Types.ObjectId(cid);
	var uid = mongoose.Types.ObjectId(uid);
	console.log('aaaaaaaa',cid,uid);
	UserQuizModel.findOne({uid:uid,cid:cid},function(err, doc){
		if(err){callback(err, null);}
		else{
			console.log("findQuizByCIDAndUID".green);
			if(doc ==null){
			    doc = new UserQuizModel();
			    doc.uid = uid;
			    doc.cid = cid;
			    doc.save(function(err,data){
			       console.log('save success ');
				   callback(null, data);
			    })
           }else{
		        console.log('findQuizByCIDAndUID  find ',doc._id);
		        callback(null, doc);
		   }			
		}
	})	
}

function findQuizById(id,callback){
    var id = mongoose.Types.ObjectId(id);
	UserQuizModel.findById(id,function(err, doc){
		if(err){callback(err, null);}
		else{
			console.log("findQuizById".green);
			callback(null, doc);
		}
	})	
}

function findQuizsByQuery(condition,option,callback){

	UserQuizModel.find(condition,'uid fin answ s_date ',option, function(err, docs){
		   if(err){ callback(err, null); } //
		   else
		   {
			   callback(err,docs);
		   }
	});
}

function updateAnswer(quiz_id,question_id,answer,callback){
	
	var options = { new: false };	
	var quiz_id = mongoose.Types.ObjectId(quiz_id);
	UserQuizModel.findOneAndUpdate({'_id':quiz_id},{'$addToSet':{'answ.qid':question_id,'answ.con':answer}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

function updateAnswer2(cid,uid,question_id,answer,callback){
	
	var options = { safe: true, upsert: true };	
	var cid = mongoose.Types.ObjectId(cid);
	var uid = mongoose.Types.ObjectId(uid);
	var qid = mongoose.Types.ObjectId(question_id);//
	//,'time':new Date().getTime()
	var answer = {'qid':qid,'con':answer };  //    
	UserQuizModel.findOneAndUpdate({'uid':uid,'cid':cid,'answ.qid':qid},{'$addToSet':{'answ': answer} },options,function(err,ref){
		if(err) {
			console.log(' '.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
}

/*
	UserQuizModel.update({'uid':uid,'cid':cid,'answ.qid':qid}, { $set: {'answ.$.con': answer,'answ.$.time':new Date().getTime(),'answ.$.qid':qid}},options,function(err,ref){
		if(err) {
			console.log(' '.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
*/

function updateAnswer3(cid,uid,question_id,answer,callback){
	
	var options = { upsert: false };	
	var cid = mongoose.Types.ObjectId(cid);
	var uid = mongoose.Types.ObjectId(uid);
	var qid = mongoose.Types.ObjectId(question_id);//
	//{'answ.$.con': answer,'answ.$.time':new Date().getTime()}
	var answ= {'qid':qid,'con':answer, 'time':new Date().getTime() }; 
	UserQuizModel.findOne({'uid':uid,'cid':cid,'answ.qid':qid},function(err,ref){
	    if(err){
			console.log(' '.red,err);
			callback(err, null);
		}else{
		
		    if(ref == null){
			    console.log('ref is null'.red);
		        ///////////////////////////	
				/**/
	            UserQuizModel.findOneAndUpdate({'uid':uid,'cid':cid},{'$addToSet':{'answ': answ} },options,function(err,ref){
		            if(err) {
			            console.log(' '.red,err);
			            callback(err, null);
		            }else{
		                callback(null,ref);
		            }
	            })
                
                //ref.answ.push( answ );				
                ////////////////////////////////////////////////	
		    }
		    else {
			      //////////////////
			    console.log('ref is not null'.green);
	            UserQuizModel.update({'uid':uid,'cid':cid,'answ.qid':qid}, { $set:{ 'answ.$.con': answer,'answ.$.time':new Date().getTime() } },options,function(err,ref){
		            if(err) {
			            console.log(' '.red,err);
			            callback(err, null);
		            }else{
		                callback(null,ref);
		            }
	            })			
	            /////////////////////////////////
	        }
		
		
		
		}
	
	})
	
	
}

/*
function updateAnswer3(cid,uid,question_id,answer,callback){
	
	var options = { new: false };	
	var cid = mongoose.Types.ObjectId(cid);
	var uid = mongoose.Types.ObjectId(uid);
	var qid = mongoose.Types.ObjectId(question_id);//,{'qid':qid} 
	UserQuizModel.findOne({'uid':uid,'cid':cid,'answ.qid':qid},function(err,ref){
		if(err) {
			console.log(' '.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
}
*/


function deleteQuiz(id,callback){	
	var id = mongoose.Types.ObjectId(id);
	if(UserQuizModel){
		UserQuizModel.findByIdAndRemove(id,function(err){
			  if(err){console.log('err remove');callback(err, null);}	
			  else {
				  console.log('remove good ');
				  callback(null);
			  }
		});
	}
}
exports.createQuiz =  createQuiz
exports.findQuizById = findQuizById;
exports.findQuizsByQuery =findQuizsByQuery;

exports.updateAnswer = updateAnswer;
exports.updateAnswer2 = updateAnswer2;
exports.updateAnswer3 = updateAnswer3;

exports.deleteQuiz = deleteQuiz;

exports.findQuizByCIDAndUID = findQuizByCIDAndUID;