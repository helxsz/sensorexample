var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;
var Schema = mongoose.Schema;
var color = require('colors');
/*
http://sebastian.formzoo.com/2012/04/12/mongodb-shorten-the-objectid/
https://github.com/siong1987/mongoose-autoincr/blob/master/index.js
http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
http://noppadetnodejs.blogspot.co.uk/2013/04/nodejs-mongoose-mongodb-auto-increment.html
https://github.com/Chevex/mongoose-auto-increment/blob/master/index.js	

If multiple clients were to invoke the getNextSequence() method with the same name parameter, then the methods would observe one of the following behaviors:

Exactly one findAndModify() would successfully insert a new document.
Zero or more findAndModify() methods would update the newly inserted document.
Zero or more findAndModify() methods would fail when they attempted to insert a duplicate.
If the method fails due to a unique index constraint violation, retry the method. Absent a delete of the document, the retry should not fail.

*/
var CounterSchema = mongoose.Schema({
_id:{type:String,required:true,unique:true},
c:{type:Number,default:0}
});

var CounterModel = mongoose.model('Counter',CounterSchema);

exports.getNextSequence = getNextSequence;

function getNextSequence(id,callback){
 	var options = { 'new': true ,'upsert': true};	
	CounterModel.findByIdAndUpdate(id,{'$inc':{'c':1}},options,function(err,ref){
		if(err) {
			console.log('getNextSequence'.red,err);
			callback(err, null);
		}else{
			console.log('getNextSequence'.green+ref);				  
		    callback(null,ref);
		}
	})
}