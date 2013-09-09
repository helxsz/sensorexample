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
		 
		 invitations: [{ type: ObjectId, ref: 'Invitation' }],

         plans:[ {type:ObjectId, ref: 'StudentPlan'}]		 
           
});
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
    var user = this;
    if (this.isNew)
    this.cdate = Date.now();
    else
    this.mdate = Date.now();  		
    next();
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
	CourseModel.find(condition,'tutor title desc city sdate edate tags',option,function(err, doc){
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

function findCourseById(id,callback){
    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }

	CourseModel.findById(id,'tutor title desc city sdate edate img tags',function(err, doc){
		if(err){callback(err, null);}
		else{
			console.log("findOneCourse".green);
			callback(null, doc);
		}
	})	
}

//http://stackoverflow.com/questions/11341536/mongoose-populate-embedded-document-in-cascade
//http://stackoverflow.com/questions/10568281/mongoose-using-populate-on-an-array-of-objectid

function findCourseAndTutorById(id,callback){
    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }

	CourseModel.findById(id).populate('tutor.id','username img about').exec(function(err, users) { 
		if(err){callback(err, null);}
		else{
			callback(null, users);
		}	   
	})

}

function deleteCourseById(id,callback){
    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
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
    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
	CourseModel.findById(id,'tutor title img desc summ cate city sdate edate tags',function(err, course){
		if(err){callback(err, null);}
		else{
			console.log("getCourseSetting".green);
			callback(null, course);
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

    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }

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
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }	
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'stud':uid},'$inc':{'stat.s_count':1}},options,function(err,ref){
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
    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }
	
 	var options = { new: false ,select:'_id'};	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'stud':uid},'$inc':{'stat.s_count':-1}},options,function(err,ref){
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

    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }

	CourseModel.findById(id).populate('stud','username img').exec(function(err, users) { 
		if(err){callback(err, null);}
		else{
			callback(null, users);
		}	   
	})

}

//////////////////////////////////          Qeustions           //////////////////////////////////////


function findCourseQuestionsById(id,callback){

    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
	CourseModel.findById(id).populate('ques').exec(function(err, course) { 
		if(err){callback(err, null);}
		else{
			//console.log("findCourseQuestionsById".green,course.ques.length,course.ques);
			callback(null, course.ques);
		}	   
	})

}

function addQuestion(cid,qid,callback){
    try {
         qid = mongoose.Types.ObjectId(qid);
    } catch(e) {
        return callback(e, null);
    }	
	
	
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
    try {
         qid = mongoose.Types.ObjectId(qid);
    } catch(e) {
        return callback(e, null);
    }
	
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

    var id;
    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
      /// problem sort by date doesn't work and return me full documents rather than the comments itself
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
    try {
         mid = mongoose.Types.ObjectId(mid);
    } catch(e) {
        return callback(e, null);
    }
	
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

    try {
         uid = mongoose.Types.ObjectId(uid);
    } catch(e) {
        return callback(e, null);
    }		
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
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }		
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
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }		
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

    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }		
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

    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'plans':plan_id}},options,function(err,ref){
		if(err) {
			//console.log('update addInvitationToList'.red,err);
			callback(err, null);
		}else{
			//console.log('update addInvitationToList  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
}

function removePlanFromList(cid,plan_id,callback){
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
	
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

    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }
	
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

/************************************  invitation ********************************/

function addInvitationToList(cid,invitation_id,callback){

    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
	
		
	var options = { new: false , select:'_id'};		
	/*	$ne:self._id */
	CourseModel.findOneAndUpdate({'_id':cid},{'$addToSet':{'invitations':invitation_id}},options,function(err,ref){
		if(err) {
			//console.log('update addInvitationToList'.red,err);
			callback(err, null);
		}else{
			//console.log('update addInvitationToList  '.green+ref);				  
		    callback(null,ref);
		}
	})
	
}

function removeInvitationFromList(cid,invitation_id,callback){
    try {
         cid = mongoose.Types.ObjectId(cid);
    } catch(e) {
        return callback(e, null);
    }
	
	
 	var options = { new: false ,select:'_id'};	
	CourseModel.findOneAndUpdate({'_id':cid},{'$pull':{'invitations':invitation_id}},options,function(err,ref){
		if(err) {
			//console.log('update removeInvitationFromList'.red,err);
			callback(err, null);
		}else{
			//console.log('update removeInvitationFromList'.green+ref);				  
		    callback(null,ref);
		}
	}) 
}

function findCourseInvitationById(id,callback){

    try {
         id = mongoose.Types.ObjectId(id);
    } catch(e) {
        return callback(e, null);
    }

	
	CourseModel.findById(id).populate('invitations','name email time status reply valid').exec(function(err, invis) { 
		if(err){callback(err, null);}
		else{
		    console.log('findCourseInvitationById',invis,invis.invitations.length);
			callback(null, invis.invitations);
		}	   
	})
	
/*	
	CourseModel.findById(id,'invitations',function(err, invis){
		if(err){callback(err, null);}
		else{
		    console.log('findCourseInvitationById',invis,invis.length);
			callback(null, invis);
		}	
	});
*/
}

exports.addInvitationToList = addInvitationToList;
exports.removeInvitationFromList = removeInvitationFromList;
exports.findCourseInvitationById = findCourseInvitationById;
/*************************************************************************************/

exports.createNewCourse = createNewCourse;

exports.getCourseSetting =getCourseSetting;
exports.updateCourseSetting = updateCourseSetting;
exports.findCoursesAdmin =findCoursesAdmin;

exports.findCoursesByQuery = findCoursesByQuery;
exports.findCourseById = findCourseById;

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
exports.enableClassShown;