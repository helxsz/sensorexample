var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;
require('colors');
////////////////////////////////////////////////////////////////////////////////
// real time analytics
//http://blog.mongodb.org/post/171353301/using-mongodb-for-real-time-analytics
//http://blog.tommoor.com/post/24059620728/realtime-analytics-at-buffer-with-mongodb
//http://www.slideshare.net/dacort/mongodb-realtime-data-collection-and-stats-generation
var uuid = require('node-uuid');


//enum: [ 'sub', 'poster', 'blocked' ]
var CourseSchema = mongoose.Schema({
         cid:{ type:Number,  unique:true, index: true},
         tutor:{id:{ type: ObjectId, ref: 'User' },name:String},
		 title:String,
		 summ:String,
		 desc:String,
		 img:String,
		 sdate:Date,  // start date
		 edate:Date,  // end date
		 city:String,   // city
		 tags:[String],	
		 cate:String,
		 acti:{type:Boolean, "default":false},
		 lang:{type:String, "default":'en'},
		 
	     /////////////////////////////////////
		 cdate: Date,  // created date
         mdate: Date,  // updated date
		 /////////////////////////////////////
		 stud:[{ type: ObjectId, ref: 'User' }], // student
		 ques:[{ type: ObjectId, ref: 'Question' }],       // question
		 post:[{ type: ObjectId, ref: 'Post'}],
		 
		 
		 com:[Comment],
		 stat:{
		    s_count:{type:Number,default:0},  //count on students
			c_count:{type:Number,default:0},  //count on comments
			p_count:{type:Number,default:0},   // count on posts
			q_count:{type:Number,default:0}   // count on questions
		 },
          
         classes:[ CourseClassSchema ],		  
         ////////////////////////////////////////////////////////////////
		 setting: { pri:{type:Boolean,default:true}, mode: {type:Number,default:0}},  // mode enum : 1 public, 0 private,
		 
		 //invitations: [{ type: ObjectId, ref: 'Invitation' }],
         invitations: [InvitationSchema],
		 cr:[]
           
}
//, { _id: false }
);
//http://stackoverflow.com/questions/11304739/how-to-store-threaded-comments-using-mongodb-and-mongoose-for-node-js
//http://blog.mongodb.org/post/29140593886/designing-mongodb-schemas-with-embedded-non-embedded
//http://stackoverflow.com/questions/5224811/mongodb-schema-design-for-blogs
var Comment = mongoose.Schema({
    name  :  { type: String }
  , img   :  { type:String }
  , date  :  { type: Date, default: Date.now }
  , text  :  String 
  , slug  :  {type:String, index:true}
});

var CourseClassSchema = mongoose.Schema({
	ref_id:{type:ObjectId},
	type:{type:Number,default:0},  // { post:1, question:2, }
	
	title:{type:String},
	req:[String],
    status:{type:Number,default:0},
    score:{type:Number,default:0},	
	duration:{type:Number,default:0}
});





var CourseModel = mongoose.model('Course',CourseSchema);
exports.CourseModel = CourseModel;


CourseSchema.pre('save', function(next) {
    var course = this;
    if (this.isNew){
        this.cdate = Date.now();
		this.cid = require('./counter_model').getNextSequence('cid',function(err,data){
		     if(err && err.code) console.log('err on counter'.red,err);
			 else {
				 this.cid = data.c;
				 next();
			 }
		});		
	}
    else{
        this.mdate = Date.now();
		next();
    }	
    
});

function createNewCourse(data,callback){
	CourseModel.create(data,function(err,course){
		if(err) {
			console.log('createNewCourse err '.red,err);
			callback(err, null);
		}
		else {
			//console.log('createNewCourse   '.green);
			callback(null, course);
		}
	})	
}


function findCoursesByQuery(condition,option,callback){
	CourseModel.find(condition,'tutor title desc city sdate edate tags img',option,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function findCoursesByQuery2(condition,fields,option,callback){
	CourseModel.find(condition,fields,option,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function findCoursesAndTutorByQuery(condition,option,callback){  //
	CourseModel.find(condition,'tutor title desc city sdate edate tags img',option).populate({path:'tutor.id',select:'username img'}).exec(function (err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}



function findCoursesAdmin(cid,uid,callback){
	CourseModel.findOne({'_id':cid},'tutor title desc city sdate edate tags',function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function findCourseByQuery(condition,fields,callback){
	CourseModel.findOne(condition,fields,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function findCourseById(id,callback){

	CourseModel.findById(id,'tutor title desc city sdate edate img tags',function(err, doc){
		if(err){callback(err, null);}
		else{
			console.log("findCourseById".green);
			callback(null, doc);
		}
	})	
}

function findCourseById2(id,fields,callback){

	CourseModel.findById(id,fields,function(err, doc){
		if(err){callback(err, null);}
		else{
			//console.log("findOneCourse".green);
			callback(null, doc);
		}
	})	
}

//http://stackoverflow.com/questions/11341536/mongoose-populate-embedded-document-in-cascade
//http://stackoverflow.com/questions/10568281/mongoose-using-populate-on-an-array-of-objectid

function findCourseAndTutorById(id,callback){
	CourseModel.findById(id).populate('tutor.id','username img about').exec(function(err, users) { 
		if(err){callback(err, null);}
		else{
			callback(null, users);
		}	   
	})
}

function findCourseAndTutorById2(id,callback){
	CourseModel.findById(id,'tutor title desc city sdate edate tags img').populate('tutor.id','username img about').exec(function(err, users) { 
		if(err){callback(err, null);}
		else{
			callback(null, users);
		}	   
	})
}

exports.findCourseAndTutorById2 = findCourseAndTutorById2;

function deleteCourseById(id,callback){
	if(CourseModel){
		CourseModel.findByIdAndRemove(id,function(err){
			  if(err){console.log('err remove');callback(err, null);}	
			  else {
				  console.log('remove good ');
				  callback(null);
			  }
		});
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

function getCourseSetting(id,callback){
	/*
	CourseModel.findById(id,'tutor title img desc summ cate city sdate edate tags',function(err, course){
		if(err){callback(err, null);}
		else{
			console.log("getCourseSetting".green);
			callback(null, course);
		}
	})
    */	
	CourseModel.findById(id,'tutor title desc city sdate edate tags img').populate({path:'tutor.id',select:'username img'}).exec(function (err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})		
}

function updateCourseSetting(condition,update,callback){
	var options = { new: false };	
	CourseModel.findOneAndUpdate(condition,update,options,function(err,ref){
		if(err) {
			console.log('updateCourseSetting'.red,err);
			callback(err, null);
		}else{
			console.log('updateCourseSetting  '.green+ref);				  
		    callback(null,ref);
		}
	})
}


////////////////////////////////////////////////////////////////////////////////////////////////////////


function findCoursePostsById(id,callback){
	CourseModel.findById(id).populate('post').exec(function(err, posts) { 
		if(err){callback(err, null);}
		else{
			console.log("findCoursePostsById".green,posts.length);
			callback(null, posts);
		}	   
	})

}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// should record when the student join in the course
function joinCourse(cid,uid,callback){
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id  findOneAndUpdate  */
	CourseModel.update({'_id':cid},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
} 
//,'$inc':{'stat.s_count':-1}
function disJoinCourse(cid,uid,callback){
 	var options = { new: false ,select:'_id'};	
	CourseModel.update({'_id':cid},{'$pull':{'stud':uid},'$inc':{'stat.s_count':-1}},options,function(err,ref){
		if(err) {
			console.log('update disJoinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update disJoinCourse'.green+ref);				  
		    callback(null,ref);
		}
	})  
}

function findCourseStudentsById(id,callback){
	CourseModel.findById(id).populate('stud','username img').exec(function(err, users) { 
		if(err){callback(err, null);}
		else{
			callback(null, users);
		}	   
	})

}

//////////////////////////////////          Qeustions           //////////////////////////////////////


function findCourseQuestionsById(id,fields,callback){ 
	CourseModel.findById(id).populate( {path: 'ques',select:fields} ).exec(function(err, course) { 
		if(err){callback(err, null);}
		else{
			//console.log("findCourseQuestionsById".green,course.ques.length,course.ques);
			callback(null, course.ques);
		}	   
	})

}

function addQuestion(cid,qid,callback){
	var options = { new: false ,select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'ques':qid},'$inc':{'stat.q_count':1}},options,function(err,ref){
		if(err) {
			console.log('add Question'.red,err);
			callback(err, null);
		}else{
			console.log('add Question  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
} 


function removeQuestion(cid,qid,callback){
 	var options = { new: false ,select:'_id'};	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'ques':qid},'$inc':{'stat.q_count':-1}},options,function(err,ref){
		if(err) {
			console.log('removeQuestion'.red,err);
			callback(err, null);
		}else{
			console.log('removeQuestion'.green+ref);				  
		    callback(null,ref);
		}
	})  
}

///////////////////////////////////    Comments      /////////////////////////////////////

function findCourseCommentsById(id,option,callback){

      // problem sort by date doesn't work and return me full documents rather than the comments itself
	CourseModel.findById(id,{'com':{ $slice: [ option.skip ,option.limit] }},function(err, comm) { 
		if(err){callback(err, null);}
		else{
			console.log("findCourseCommentsById".red,comm);
			callback(null, comm);
		}	   
	})

}

/*
new: bool - true to return the modified document rather than the original. defaults to true
upsert: bool - creates the object if it doesn't exist. defaults to false.
sort: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
select: sets the document fields to return

*/
// option doesn't work	  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
function addComment(cid,name,img,text,callback){
	
	var options = { new: false,select: '_id ' };	
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$push':{'com':{'name':name,'img':img,'text':text,'date':new Date(),'slug':uuid.v4()}},'$inc':{'stat.c_count':1}},options,function(err,ref){
		if(err) {
			console.log('add addComment'.red,err);
			callback(err, null);
		}else{
			console.log('add addComment  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
} 

function removeComment(cid,mid,callback){

 	var options = { new: false, select: '_id' };	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'com._id':mid},'$inc':{'stat.c_count':-1}},options,function(err,ref){
		if(err) {
			console.log('removeComment'.red,err);
			callback(err, null);
		}else{
			console.log('removeComment'.green+ref);				  
		    callback(null,ref);
		}
	})  
}


/****************************************  add classes 
var CourseClassSchema = mongoose.Schema({
	ref_id:{type:ObjectId},
	type:{type:String},
	req:{type:String},
	title:{type:String},
	
    status:{type:Number,default:0},
    score:{type:Number,default:0},	
	duration:{type:Number,default:0}
});

add class and send notification
or 
just add class
 ***************************************/
function addClass(uid, title,type,requirements,duration,scores,status, callback){
	
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'classes':{'type':type,'title':title,'req':requirements,'duration':duration,'scores':scores,'status':status}}
	                             ,'$inc':{'stat.p_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

function disableClassShown(cid,classId, callback){
	
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'classes':{'status':0}}
	                             ,'$inc':{'stat.p_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

function enableClassShown(cid, classId, callback){
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'classes':{'status':1}}
	                             ,'$inc':{'stat.p_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

function removeClass(cid,classId,callback){
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'classes':{'status':1}}
	                             ,'$inc':{'stat.p_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
}

/************************************  plan  *************************************/
function addPlanToList(cid,plan_id,callback){
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'plans':plan_id}},options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
	
}

function removePlanFromList(cid,plan_id,callback){
	
 	var options = { new: false ,select:'_id'};	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'plans':plan_id}},options,function(err,ref){
		if(err) {
			//console.log('update removeInvitationFromList'.red,err);
			callback(err, null);
		}else{
			//console.log('update removeInvitationFromList'.green+ref);				  
		    callback(null,ref);
		}
	}) 
}

function findCoursePlansById(id,callback){
	
	CourseModel.findById(id).populate('plans','cid sid plan count').exec(function(err, plans) { 
		if(err){callback(err, null);}
		else{
		    console.log('findCourseInvitationById'.green,plans);
			callback(null, plans);
		}	   
	})

}
exports.addPlanToList =addPlanToList;
exports.removePlanFromList =removePlanFromList;
exports.findCoursePlansById = findCoursePlansById;

/************************************  invitation with ObjectId  not used anymore********************************/

function addInvitationToList(cid,invitation_id,callback){
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'invitations':invitation_id}},options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})
	
}

function removeInvitationFromList(cid,invitation_id,callback){

 	var options = { new: false ,select:'_id'};	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'invitations':invitation_id}},options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	}) 
}

function findCourseInvitationById(id,callback){

	CourseModel.findById(id).populate('invitations','name email time status reply valid').exec(function(err, invis) { 
		if(err){callback(err, null);}
		else{
		    console.log('findCourseInvitationById',invis,invis.invitations.length);
			callback(null, invis.invitations);
		}	   
	})
}
exports.addInvitationToList = addInvitationToList;
exports.removeInvitationFromList = removeInvitationFromList;
exports.findCourseInvitationById = findCourseInvitationById;

/******************   invitation with embedded document  *******************************/

var InvitationSchema = new mongoose.Schema({
    token: { type:String, required: true},
    name: { type:String, required: false, sparse: true },   // optional
	email: { type:String, required: true, unique:true},  // compulsory
	time: { type: Date, default: Date.now },
	status: { type: Number, default: 0 , required: true, enum:[0, 1,2,3,4,5]},  // enum [ email_not_sent 0, email_failed 1, email_sent 2,  not_replyed 3, accpeted 4, refused 5, ]
	//_id:String  // id as the token,
	reply:{time:Date,extra:String},
	valid:{ type: Boolean, default: true },
});

CourseSchema.index({ 'invitations.email': 1 });

exports.addInvitation = addInvitation;
exports.removeInvitation = removeInvitation;
exports.findCourseInvitation = findCourseInvitation;
exports.addStudentByInvitation = addStudentByInvitation;

//{'email':email,'_id':token,'status':email_status}
function addInvitation(cid,email,token,status,callback){
	var options = { new: false , select:'_id'};		
	CourseModel.update({'_id':cid},{'$addToSet':{'invitations':{'email':email,'token':token,'status':status,'time':new Date()}}},options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	})	
}

function removeInvitation(cid,email,callback){
	
 	var options = { new: false ,select:'_id'};	
	CourseModel.update({'_id':cid},{'$pull':{'invitations.$.email':email}},options,function(err,ref){
		if(err) {
			callback(err, null);
		}else{
		    callback(null,ref);
		}
	}) 
}

function findCourseInvitation(cid,callback){

	CourseModel.findById(cid,'invitations', function(err,data) { 
		if(err){callback(err, null);}
		else{
			callback(null, data);
		}	   
	})
}

function addStudentByInvitation(cid,token,uid,callback){

    var options = { new: false , select:'_id'};	
    //	InvitationModel.findOneAndUpdate({'_id':id},{'$set':{'status':5,'reply.extra':goal}},options,function(err,ref){
	//CourseModel.update({'_id':cid,'invitations.token':token},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}}, function(err,data) {
    // 		
	//CourseModel.update({'_id':cid,'invitations':{'$elemMatch':{'token':token}}},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}},options,function(err,data) { 
	// http://stackoverflow.com/questions/10432677/update-field-in-exact-element-array-in-mongodb   http://docs.mongodb.org/manual/reference/operator/positional/
	//CourseModel.update({'_id':cid,'invitations.token':token},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}}, function(err,data) { 
	CourseModel.update({'_id':cid,'invitations.token':token},{'$set': { "invitations.$.status" : 4 } ,'$addToSet':{'stud':uid}}, function(err,data) { 
 	    if(err){callback(err, null);}
		else{
		    console.log('addStudentByInvitation'.green,data);
			callback(null, data);
		}	   
	})
}

function checkUserFromInvitation(cid,token,callback){
 	CourseModel.findOne({'_id':cid,'invitations.token': token },'_id', function(err,data) { 
 	    if(err){callback(err, null);}
		else{
		    console.log('checkUserFromInvitation'.green,data);
			callback(null, data);
		}	   
	})   
}

exports.checkUserFromInvitation = checkUserFromInvitation;
/*
function joinCourse(cid,uid,callback){
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = { new: false , select:'_id'};		
	CourseModel.update({'_id':cid},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}},options,function(err,ref){
		if(err) {
			console.log('update joinCourse'.red,err);
			callback(err, null);
		}else{
			console.log('update joinCourse  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
}
*/
/*************************************************************************************/

exports.createNewCourse = createNewCourse;

exports.getCourseSetting =getCourseSetting;
exports.updateCourseSetting = updateCourseSetting;
exports.findCoursesAdmin =findCoursesAdmin;

exports.findCoursesByQuery = findCoursesByQuery;
exports.findCoursesByQuery2 = findCoursesByQuery2;
exports.findCourseById = findCourseById;
exports.findCourseById2 = findCourseById2;
exports.findCoursesAndTutorByQuery = findCoursesAndTutorByQuery;

exports.findCourseByQuery = findCourseByQuery;
exports.findCourseAndTutorById = findCourseAndTutorById;
exports.findCourseStudentsById = findCourseStudentsById;
exports.findCourseCommentsById =findCourseCommentsById;
exports.findCoursePostsById =findCoursePostsById;

exports.findCourseQuestionsById = findCourseQuestionsById;
exports.deleteCourseById = deleteCourseById;

exports.joinCourse = joinCourse;
exports.disJoinCourse = disJoinCourse;

exports.addQuestion = addQuestion;
exports.removeQuestion = removeQuestion;

exports.addComment = addComment;
exports.removeComment = removeComment;


exports.addClass = addClass;
exports.removeClass = removeClass;
exports.disableClassShown;




CourseSchema.index({ 'cr.key': 1 });

function addNotiCriteriaKey(id,key,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {
        CourseModel.update({'cid':id},{'$addToSet':{'cr':{'key':key}}},options,function(err,data){
	       if(err) callback(err,null);
	       else callback(null,data);
	    })
	}else if( typeof key == 'object' && (key instanceof Array) ){	 
        // 1  doesn't work
		// ['111','222','333']
        //_.map(key, function(element){ return {'key':element}; });	
        //console.log(key);
        // 2  seem to work
        // 	[ {key:'111'},{'key':'222'},{'key':'333'}]	
        CourseModel.update({'cid':id},{'$addToSet':{'cr':{ '$each': key}}},options,function(err,data){
	       if(err) callback(err,null);
	       else callback(null,data);
	    })		
	}	
}

function removeNotiCriteriaKey(id,key,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {	
        CourseModel.update({'cid':id},{'$pull':{'cr':{'key':key}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
		//_.map(key, function(element){ return {'key':element}; });
		CourseModel.update({'cid':id},{'$pull':{'cr':{ '$each': key}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })       		
	}	
}

function addNotiCriterialValueToKey(id,key,value,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {		
        CourseModel.update({'cid':id,'cr.key':key},{'$addToSet':{'cr.$.val':value}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
	    // still having problem and error
        //_.map(value, function(element){ return {'val':element}; });		
        CourseModel.update({'cid':id,'cr.key':key},{'$addToSet':{'cr.$':{ '$each': value}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}	
}

function removeNotiCriterialValueFromKey(id, key,value,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {	
        CourseModel.update({'cid':id,'cr.key':key},{'$pull':{'cr.$.val':value}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
	    // still having problem and error
        //_.map(value, function(element){ return {'val':element}; });			  
        CourseModel.update({'cid':id,'cr.key':key},{'$pull':{'cr.$':{ '$each': value}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
      		
	}	
}
exports.addNotiCriteriaKey = addNotiCriteriaKey;
exports.removeNotiCriteriaKey = removeNotiCriteriaKey;
exports.addNotiCriterialValueToKey = addNotiCriterialValueToKey;
exports.removeNotiCriterialValueFromKey = removeNotiCriterialValueFromKey;


function queryCriteria(criteria,option,callback){
    CourseModel.find(criteria,'cid _id',option, function(err,data){
	    if(err) callback(err,null);
		else callback(null,data);
	})
}
exports.queryCriteria = queryCriteria;
exports.enableClassShown;