var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var invitationSchema = new mongoose.Schema({
    name: { type:String, required: false},   // optional
	email: { type:String, required: true},  // compulsory
	time: { type: Date, default: Date.now },
	status: { type: Number, default: 0 , required: true, enum:[0, 1,2,3,4,5]},  // enum [ email_not_sent 0, email_failed 1, email_sent 2,  not_replyed 3, accpeted 4, refused 5, ]
	//_id:String  // id as the token,
	reply:{time:Date,extra:String},
	valid:{ type: Boolean, default: true },
});

// goal, 
// invitation sent is modeled as a queue task
// status change : 
 
var InvitationModel = mongoose.model('Invitation',invitationSchema);
exports.InvitationModel = InvitationModel; 


exports.createInvitation = createInvitation;
exports.deleteInvitation = deleteInvitation;
exports.acceptInvitation = acceptInvitation;
exports.refuseInvitation = refuseInvitation;

function createInvitation(data,callback){
	InvitationModel.create(data,function(err,docs){
		if(err) {
			console.log('err ');
			callback(err, null);
		}
		else {
			callback(null, docs);
		}
	})
}

function deleteInvitation(id,callback){
    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(err, null);
    }
	
	InvitationModel.findByIdAndRemove(id,function(err){
		if(err){console.log('err remove');callback(err, null);}	
		else {
			callback(null);
		}
	});
}

function updateEmailStatus(id, status, callback){


}

function acceptInvitation(id, goal , callback){
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
 	var options = { new: false ,select:'_id'};	
	InvitationModel.findOneAndUpdate({'_id':id},{'$set':{'status':5,'reply.extra':goal}},options,function(err,ref){
		if(err) {
			console.log('acceptInvitation'.red,err);
			callback(err, null);
		}else{
			console.log('acceptInvitation'.green+ref);				  
		    callback(null,ref);
		}
	})

}

function refuseInvitation(id, reason , callback){
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
 	var options = { new: false ,select:'_id'};	
	InvitationModel.findOneAndUpdate({'_id':id},{'$set':{'status':4,'reply.extra':reason}},options,function(err,ref){
		if(err) {
			console.log('refuseInvitation'.red,err);
			callback(err, null);
		}else{
			console.log('refuseInvitation'.green+ref);				  
		    callback(null,ref);
		}
	})

}

function invitationValid(){


}