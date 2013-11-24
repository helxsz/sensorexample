var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
require('colors');
////////////////////////////////////////////////////////////////////////////////
// real time analytics
//http://blog.mongodb.org/post/171353301/using-mongodb-for-real-time-analytics
//http://blog.tommoor.com/post/24059620728/realtime-analytics-at-buffer-with-mongodb
//http://www.slideshare.net/dacort/mongodb-realtime-data-collection-and-stats-generation
var uuid = require('node-uuid');

/*
var HelpSchema = mongoose.Schema({
    tutor:{type: ObjectId, ref: 'User' },
    user:{type: ObjectId, ref: 'User'},
    course:{type: ObjectId, ref: 'Course'},
	chats:[ {t:Date,m:String,id:0,qid:{type: ObjectId, ref: 'Question'} }]	
});


var HelpSchema = mongoose.Schema({
    tutor:{type: ObjectId, ref: 'User' },
    user:{type: ObjectId, ref: 'User'},
    course:{type: ObjectId, ref: 'Course'},
	history:[ 
	    {  qid:{type: ObjectId, ref: 'Question'},
		   chat:[ {t:Date,m:String,id:0 }]
		}   
	]
});
*/
/**/

var HelpSchema = mongoose.Schema({
    tutor:{type: ObjectId, ref: 'User' },
    user:{type: ObjectId, ref: 'User'},
    course:{type: ObjectId, ref: 'Course'},
	question:{type: ObjectId, ref: 'Question'}, 
	chats:[ {t:Date,m:String,r:0 }]	
},{ _id: false });

var HelpModel = mongoose.model('Help',HelpSchema);
exports.HelpModel = HelpModel;

HelpSchema.index({ course: 1, user: 1,question:1 });

function createNewHelp(data,callback){
	console.log(data);
	HelpModel.create(data,function(err,docs){
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


function findHelpHistory(condition,option,callback){

	HelpModel.find(condition,'',option, function(err, docs){
		   if(err){ callback(err, null); } //
		   else
		   {
			   callback(err,docs);
		   }
	});
}

function findHelpByQuery(condition,callback){
	HelpModel.findOne(condition,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function findHelpsByQuery(condition,field,option, callback){
	HelpModel.find(condition,field,option,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})
}

function updateHelp(query,update,callback){
	var options = { upsert: true };	

	HelpModel.update(query,update,options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		     console.log('update help ');
		    callback(null,ref);
		}
	})	
}


exports.createNewHelp = createNewHelp;
exports.findHelpHistory = findHelpHistory;
exports.findHelpByQuery = findHelpByQuery;
exports.updateHelp = updateHelp;
exports.findHelpsByQuery = findHelpsByQuery;