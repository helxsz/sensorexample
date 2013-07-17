var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var followSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    follow: [{ type: ObjectId, ref: 'User' }],
	followed:[{ type: ObjectId, ref: 'User' }]
});
 
var FollowModel = mongoose.model('Follow',followSchema);
exports.FollowModel = FollowModel; 

function createFollow(data,callback){
	FollowModel.create(data,function(err,follow){
		if(err) {
			console.log('createFollow err '.red,err);
			callback(err, null);
		}
		else {
			//console.log('createNewCourse   '.green);
			callback(null, follow);
		}
	})	
}

function follow(id,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = {  upsert:true };		
	/*	$ne:self._id */
	FollowModel.findOneAndUpdate({'_id':id},{'$addToSet':{'follow':uid}},options,function(err,ref){
		if(err) {
			console.log('follow'.red,err);
			callback(err, null);
		}else{
			//console.log('follow  '.green+ref);				  
		    callback(null,ref);
		}
	})	
} 
//,'$inc':{'stat.s_count':-1}
function unfollow(id,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }
	
 	var options = { new: true };	
	FollowModel.findOneAndUpdate({'_id':id},{'$pull':{'follow':uid}},options,function(err,ref){
		if(err) {
			console.log('unfollow'.red,err);
			callback(err, null);
		}else{
			//console.log('unfollow'.green+ref);				  
		    callback(null,ref);
		}
	})  
}


function isfollowedBy(id,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = { upsert:true };		
	/*	$ne:self._id */
	FollowModel.findOneAndUpdate({'_id':id},{'$addToSet':{'followed':uid}},options,function(err,ref){
		if(err) {
			console.log('follow'.red,err);
			callback(err, null);
		}else{
			//console.log('isfollowedBy  '.green+ref);				  
		    callback(null,ref);
		}
	})	
} 


function isUnfollowedBy(id,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = { new: true };		
	/*	$ne:self._id */
	FollowModel.findOneAndUpdate({'_id':id},{'$pull':{'followed':uid}},options,function(err,ref){
		if(err) {
			console.log('follow'.red,err);
			callback(err, null);
		}else{
			//console.log('isUnfollowedBy  '.green+ref);				  
		    callback(null,ref);
		}
	})	
} 

function inFollowList(id,uid,callback){

    if(typeof uid == String)
    { 
	  try {      
	    uid = mongoose.Types.ObjectId(uid);
      } catch(e) {
        return callback(e, null);
      }
	}
	//'follow':{'$in':uid},
	FollowModel.findOne({'_id':id,'follow':uid},function(err,ref){
		if(err) {
			console.log('follow'.red,err);
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})	
}


function getFollowList(id,callback){
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
	FollowModel.findById(id).populate('follow', 'username img').exec(function(err, follow) { 
		if(err){callback(err, null);}
		else{
			console.log("getFollowList".green,follow.length);
			callback(null, follow);
		}	   
	})
}

function getFollowedList(id,callback){
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
	FollowModel.findById(id).populate('followed', 'username img').exec(function(err, follow) { 
		if(err){callback(err, null);}
		else{
			console.log("getFollowedList".green,follow.length);
			callback(null, follow);
		}	   
	})
}

exports.createFollow = createFollow;
exports.follow = follow;
exports.unfollow = unfollow;
exports.isfollowedBy = isfollowedBy;
exports.isUnfollowedBy = isUnfollowedBy;
exports.inFollowList = inFollowList;

exports.getFollowList = getFollowList;
exports.getFollowedList = getFollowedList;