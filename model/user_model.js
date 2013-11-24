var mongoose = require('mongoose'),
   ObjectId = mongoose.Schema.ObjectId;
var crypto = require('crypto'), 
	uuid = require('node-uuid');
var color = require('colors');
var _ = require('underscore');


var UserSchema = mongoose.Schema({ 
								// auth  
								uid:{ type:Number, unique:true, index: true },
                                username:{type:String, required:true, unique:true,display:{help:'This must be a unique name'}},
                        		email: { type: String, required: true, index: { unique: true }, validate: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/ },
								password: { type: String, required: true },
								salt:{type:String, required:false, "default":uuid.v1 },
								// profile
								fullname:{type:String, required:false},
								about:{type:String, required:false},
                                lang:{type:String, "default":'en'},
								img: String,
								loc:{type:String, required:false},
                                // lock properties
                                loginAttempts: { type: Number, required: true, default: 0 },
                                lockUntil: { type: Number },
								// time properties
								cdate:{type:Date},
                                mdate:{type:Date},
								// admin properties
								admin:{type:String,sparse:true,enum: ['admin', 'course_admin', 'feedback_admin', 'developer','web_developer','database_developer']},
								// tutor properties
								tutor:{experience:{type:String}, skills:{type:String}, courses:Number},
								// social network properties
								social:{
								   facebook:{ id:String,avatar:String,name:String,token:String},
								   twitter:{id:String,avatar:String,name:String,token:String},
								   github:{id:String,avatar:String,name:String,token:String},
								   google:{id:String,avatar:String,name:String,token:String}
								},
								cr:[]
								// other 
								/*
								activation: {
		                           authCode: {type: String },
		                           status: {type: Boolean, default: false },
	                            },
	                            resetPass: { 
		                            authCode: {type: String }, 
		                            created: {type: String }
	                            },
								schools: {
		                            college: String,
		                            highSchool: String,
	                            }
								*/
                            }
							//, { _id: false }
						);

						  

var UserModel = mongoose.model('User',UserSchema);
exports.UserModel = UserModel;

/**
    middleware

*/

UserSchema.pre('save', function(next) {
    var user = this;
    console.log('pre  save',this.username,this.password,this.email);
    if (this._doc.password == '_default_' ){    //this._doc.password&& this._doc.password != '_default_'
	    //console.log('old',this._doc.password,this.password);
		//console.log('new',this._doc.password,this.password);
    }
    if (this.isNew){
        this.cdate = Date.now();
		console.log('change the password'.red);
		this.password = hash(this.password, this.salt);
		
		// automentid
		this.uid = require('./counter_model').getNextSequence('uid',function(err,data){
		     if(err && err.code) console.log('err on counter'.red,err);
			 else {
			     user.uid = data.c;
				 this.uid = data.c;
				 next();
			 }
		});
		// 16 chars ID  http://sebastian.formzoo.com/2012/04/12/mongodb-shorten-the-objectid/
		// encode
		var b64 = new Buffer('47cc67093475061e3d95369d', 'hex').toString('base64').replace('+','-').replace('/','_');
	
	}
    else{
        this.mdate = Date.now();
        next();		
    }		
/*  http://stackoverflow.com/questions/13582862/mongoose-pre-save-async-middleware-not-working-as-expected
    http://stackoverflow.com/questions/11872556/what-am-i-doing-wrong-in-this-mongoose-unique-pre-save-validation
    model.findOne({email : this.email}, 'email', function(err, results) {
        if(err) {
            done(err);
        } else if(results) {
            console.warn('results', results);
            self.invalidate("email", "email must be unique");
            done(new Error("email must be unique"));
        } else {
            done();
        }
    });
*/		
    
});

/* private encryption & validation methods */

var generateSalt = function(){
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var saltAndHash = function(pass, callback){
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

////////////////////////////////////////////////////////////////////////////

var hash = function(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};
 
UserSchema.methods.setPassword = function(password) {
    this.password = hash(password, this.salt);
};
 
UserSchema.methods.isValidPassword = function(password) {
    return this.password === hash(password, this.salt);
};

/****************************************************
* 
*    lock account
*    
*****************************************************/

//these values can be whatever you want - we're defaulting to a
//max of 5 attempts, resulting in a 2 hour lock
MAX_LOGIN_ATTEMPTS = 5,
LOCK_TIME = 2 * 60 * 60 * 1000;




UserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
           $set: { loginAttempts: 1 },
           $unset: { lockUntil: 1 }
        }, cb);
     }
   // otherwise we're incrementing
   var updates = { $inc: { loginAttempts: 1 } };
   // lock the account if we've reached max attempts and it's not locked already
   if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
       updates.$set = { lockUntil: Date.now() + LOCK_TIME };
   }
   return this.update(updates, cb);
};

    //expose enum on the model, and provide an internal convenience reference 
    var reasons = UserSchema.statics.failedLogin = {
     NOT_FOUND: 0,
     PASSWORD_INCORRECT: 1,
     MAX_ATTEMPTS: 2
 };

/*
UserSchema.statics.getAuthenticated = function(username, password, cb) {
this.findOne({ username: username }, function(err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) {
        return cb(null, null, reasons.NOT_FOUND);
    }

    // check if the account is currently locked
    if (user.isLocked) {
        // just increment login attempts if account is already locked
        return user.incLoginAttempts(function(err) {
            if (err) return cb(err);
            return cb(null, null, reasons.MAX_ATTEMPTS);
        });
    }

    // test for a matching password
    user.comparePassword(password, function(err, isMatch) {
        if (err) return cb(err);

        // check if the password was a match
        if (isMatch) {
            // if there's no lock or failed attempts, just return the user
            if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
            // reset attempts and lock info
            var updates = {
                $set: { loginAttempts: 0 },
                $unset: { lockUntil: 1 }
            };
            return user.update(updates, function(err) {
                if (err) return cb(err);
                return cb(null, user);
            });
        }

        // password is incorrect, so increment login attempts before responding
        user.incLoginAttempts(function(err) {
            if (err) return cb(err);
            return cb(null, null, reasons.PASSWORD_INCORRECT);
        });
    });
});
};
*/

/************************************************

      user operation

************************************************/
//create

function createNewUser(data,callback){
	UserModel.create(data,function(err,docs){
		if(err) {
			console.log('err ');
			callback(err, null);
		}
		else {
			//console.log('insert   '+docs.length);
			callback(null, docs);
		}
	})	
}


function findUsers(condition,option,callback){
    //{'limit':20,'skip':0},
	UserModel.find(condition,'username email fullname about loc cdate admin img',option, function(err, docs){
		   if(err){ callback(err, null); } //
		   else
		   {
			   //console.log("findUsers");
			   callback(err,docs);
		   }
	});
}


function findUserByQuery(condition,callback){
	UserModel.findOne(condition,function(err, doc){
		if(err){callback(err, null);}
		else{
			//console.log("findOneUser");
			//if(doc == null) console.log('doc is null');
			//else console.log(doc.name+"   "+doc.email);
			callback(null, doc);
		}
	})	
}

function findUserById(id,callback){

	
	UserModel.findById(id,function(err, doc){
		if(err){callback(err, null);}
		else{
			callback(null, doc);
		}
	})	
}

function authenticateFromPass(username,password,callback){
    
    UserModel.findOne({$or: [{username: username},{email: username}]},function(err,data){
        if(err) { 
		  console.error(err); 
		  return callback(new Error('User not found'));
		}
        if(data==null){
        		 console.error('the record doesnt exist');
				 return callback(new Error('User not found'));
        }
        console.log(data._id+"  "+data.email+"   "+password+"  "+data.username+"  "+data.salt);
		var hashedpass = hash(password, data.salt);
		console.log('hased',hashedpass);
		console.log('password',data.password);
		if(hashedpass==data.password)
		return callback(null,data);
		else
		return callback(new Error('Invalid password'));
	})

}

function updateUser(condition,update,callback){
	var options = { new: false };	
	//UserModel.findOneAndUpdate(condition,update,options,function(err,ref){
	UserModel.update(condition,update,options,function(err,ref){
		if(err) {
			console.log('err  on updateUser',err);
			callback(err, null);
		}
		else
		{
			  //console.log('update  on '+ref);				  
			  callback(null,ref);
		}
	})
}


function deleteUserById(id,callback){	
	if(UserModel){
		UserModel.findByIdAndRemove(id,function(err){
			  if(err){console.log('err remove');callback(err, null);}	
			  else {
				  console.log('remove good ');
				  callback(null);
			  }
		});
	}
}


exports.createNewUser = createNewUser;
exports.findUsers =findUsers;

exports.updateUser = updateUser;
exports.deleteUserById = deleteUserById;
exports.findUserById = findUserById;
exports.findUserByQuery = findUserByQuery;

exports.authenticateFromPass = authenticateFromPass;

exports.checkUser = function (username, callback) {
  UserModel.count({ username: username }, function (err, count) {
    if(err){console.log('err remove');callback(err, null);}	
    else callback(null,(count !== 0));
  });
};

exports.getByName = function (username, callback) {
  UserModel.findOne({ username: username }, function (err, user) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, user);
    }
  });
};

exports.getGeoNear = function(req,res){

	  var lat = parseFloat(req.query.lat);
	  var lon = parseFloat(req.query.lon)
	
}


function md5Hash(pass) {
    return crypto.createHash('md5').update(pass + "").digest('hex');
}











/************************************************************
* 
*    token authentication
* 
************************************************************/
var TokenSchema = mongoose.Schema({
								  email:String,
								  series:String,
								  token:String
});
var TokenModel = mongoose.model('token',TokenSchema);
exports.TokenModel = TokenModel;	

// var cookie = JSON.parse(req.cookies.loginToken);
function authenticateFromToken(email,series,token,callback){
   
    TokenModel.find({'email':email,'series':series,'token':token},function(err, token){
	    if(err) callback(err,null);
		else callback(null,token);
    })
}

function generateCookieToken(email,callback){

	var token = randomToken();
    var series = randomToken();
	console.log('generateCookieToken   ');
	
	TokenModel.create({'email':email,'token':token,'series':series},function(err,data){	
	    if(err) callback(err,null);
		else callback(null,data);
	})	
}

function removeToken(email,callback){

   	TokenModel.remove({'email':email},function(err,data){	
	    if(err) callback(err,null);
		else callback(null,data);
	})

}

function randomToken() {
      return Math.round((new Date().valueOf() * Math.random())) + '';
}

exports.generateCookieToken = generateCookieToken;
exports.authenticateFromToken = authenticateFromToken;
exports.removeToken =removeToken;

/***********************************************************************
            notification criteria
for example :
userModel.addNotiCriterialValueToKey(5,'abc','111',function(err,data){
    if(err) console.log(err);
	else console.log('addNotiCriterialValueToKey',data);
})
        or 
		
userModel.addNotiCriteriaKey( 5, ['111','222','333'], function(err,data){
    if(err) console.log(err);
	else {
	    console.log('addNotiCriteriaKey',data);		
	}
})	

userModel.removeNotiCriterialValueFromKey(5,'abc','111',function(err,data){
    if(err) console.log(err);
	else console.log('removeNotiCriterialValueFromKey',data);
})	

userModel.removeNotiCriterialValueFromKey(5,'abc',[{'key':'111'}],function(err,data){
    if(err) console.log(err);
	else console.log('removeNotiCriterialValueFromKey',data);
})	

 $sort: { score: 1 },  $slice: -3
 
 http://mongoosejs.com/docs/guide.html
 autoIndex
capped
collection
id
_id
read
safe
shardKey
strict
toJSON
toObject
versionKey
                                        
************************************************************************/

UserSchema.index({ 'cr.key': 1 });

function addNotiCriteriaKey(id,key,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {
        UserModel.update({'uid':id},{'$addToSet':{'cr':{'key':key}}},options,function(err,data){
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
        UserModel.update({'uid':id},{'$addToSet':{'cr':{ '$each': key}}},options,function(err,data){
	       if(err) callback(err,null);
	       else callback(null,data);
	    })		
	}	
}

function removeNotiCriteriaKey(id,key,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {	
        UserModel.update({'uid':id},{'$pull':{'cr':{'key':key}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
		//_.map(key, function(element){ return {'key':element}; });
		UserModel.update({'uid':id},{'$pull':{'cr':{ '$each': key}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })       		
	}	
}

function addNotiCriterialValueToKey(id,key,value,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {		
        UserModel.update({'uid':id,'cr.key':key},{'$addToSet':{'cr.$.val':value}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
	    // still having problem and error
        //_.map(value, function(element){ return {'val':element}; });		
        UserModel.update({'uid':id,'cr.key':key},{'$addToSet':{'cr.$':{ '$each': value}}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}	
}

function removeNotiCriterialValueFromKey(id, key,value,callback){
 	var options = { new: false ,select:'_id'};
	if( typeof key === 'string' ) {	
        UserModel.update({'uid':id,'cr.key':key},{'$pull':{'cr.$.val':value}},options,function(err,data){
	        if(err) callback(err,null);
	        else callback(null,data);
	    })
	}else if(  typeof key == 'object' && (key instanceof Array) ){
	    // still having problem and error
        //_.map(value, function(element){ return {'val':element}; });			  
        UserModel.update({'uid':id,'cr.key':key},{'$pull':{'cr.$':{ '$each': value}}},options,function(err,data){
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
    UserModel.find(criteria,'uid _id',option, function(err,data){
	    if(err) callback(err,null);
		else callback(null,data);
	})
}
exports.queryCriteria = queryCriteria;