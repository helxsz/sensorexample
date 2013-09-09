var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var likeSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    like: [{ type: ObjectId, ref: 'User' }]
});
 
var CourseLikeModel = mongoose.model('CourseLike',likeSchema);
exports.CourseLikeModel = CourseLikeModel; 

function like(cid,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = {  upsert:true };		
	CourseLikeModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'like':uid}},options,function(err,ref){
		if(err) {
			console.log('like'.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})	
} 
//,'$inc':{'stat.s_count':-1}
function unlike(cid,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }
	
 	var options = { new: true };	
	CourseLikeModel.findOneAndUpdate({'_id':cid},{'$pull':{'like':uid}},options,function(err,ref){
		if(err) {
			console.log('like'.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})  
}


function inLikeList(cid,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }
	//'follow':{'$in':uid},
	CourseLikeModel.findOne({'_id':cid,'like':uid},function(err,ref){
		if(err) {
			console.log('like'.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})	
}


function getLikeList(cid,callback){
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
	
	CourseLikeModel.findById(cid).populate('like', 'username img').exec(function(err, like) { 
		if(err){callback(err, null);}
		else{
			console.log("getLikeList".green,like.length);
			callback(null, like);
		}	   
	})
}

exports.like = like;
exports.unlike = unlike;
exports.inLikeList = inLikeList;
exports.getLikeList = getLikeList;
