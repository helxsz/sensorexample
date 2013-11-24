var crypto = require('crypto'),
    fs = require('fs'),
    moment = require('moment'),
    color = require('colors'),
    async = require('async'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    util = require("util"),
   im = require('imagemagick');

var app = require('../app').app,
    notification_api = require('./notification_api'),
    followModel = require('../model/follow_model');
    config = require('../conf/config.js'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js'); 


// Middleware  moderators  admin
var requireLogin = function(role) {
  return function(req, res, next) {
    if(req.session.uid){
		next();
	}else{
	    res.redirect('/login');
	}	
  }
};
/******************
     USER 'S OPERATION ON follow/unfollow/block/unblock/approve/deny 

https://api.instagram.com/v1/users/1574083/relationship?access_token=ACCESS-TOKEN
One of follow/unfollow/block/unblock/approve/deny.
{
    "meta": {
        "code": 200
    }, 
    "data": {
        "outgoing_status": "requested"
    }
}
*****************/

// follow
app.post('/follow/:user_id',requireLogin(''),followPeople);

// unfollow 
app.del('/follow/:user_id',requireLogin(''),notFollowPeople);
app.post('/unfollow/:user_id',requireLogin(''),notFollowPeople);

// approave / deny
app.post('/approve/:user_id',requireLogin(''),approvePeople);
app.post('/approve/:user_id',requireLogin(''),denyPeople);


function followPeople(req,res,next){
     console.log('follow People  by ID:',req.params.user_id,  req.session.uid, req.body.follow);

     var user_id = 	 req.params.user_id;
	 var follow = sanitize(req.body.follow).toInt(); 	 
	 try {
         check(follow, 'Please enter a valid integer').notNull().isInt();
     } catch (e) {
         console.log(e.message); //Please enter a valid integer
     }
	 if(follow ==0)
     {
	    async.parallel([
	        function(callback) {
	            followModel.follow(req.session.uid,user_id,function(err,data){
	                if(err){console.log('follow err');callback();}
                    else{
					   console.log('follow success'.green,data);
					   callback();
					}					
	            });			
		    },
		    function(callback) {
	            followModel.isfollowedBy(user_id,req.session.uid,function(err,data){
	                if(err){console.log('followed err');callback();}
                    else{
					   console.log('is followed success'.green,data);
					   
					   notification_api.pushUserNotification(req.params.id,req.session.uid,'follows','you');
					   
					   callback();
					}	       
	            });			  		
		    }],function(err) {
	            if (err) {
		            console.log(err);
		             next(err);
			        return;
                }	
                res.send(200,{'follow':1, "meta": { "code": 200}, "data": { "outgoing_status": "requested"  }});
		  
	    });		   
	 }
     else{	 
	    async.parallel([
	        function(callback) {
	            followModel.unfollow(req.session.uid,user_id,function(err,data){
	                if(err){console.log('unfollowerr');callback();}
                    else{
					   console.log('unfollow success'.green,data);
					   callback();
					}	       
	            });				
		    },
		    function(callback) {
	            followModel.isUnfollowedBy(user_id,req.session.uid,function(err,data){
	                if(err){console.log('isUnfollowedBy err');callback();}
                    else{
					   console.log('isUnfollowedBy success'.green,data);
					   callback();
					}	       
	            });			  		
		    }],function(err) {
	            if (err) {
		            console.log(err);
		            next(err);
			        return;
                }	
                res.send(200,{'follow':0,"meta": { "code": 200}, "data": { "outgoing_status": "requested"  }});	
                				
	    });	
     } 
}

function notFollowPeople(req,res,next){
   console.log('unFollow People by ID:',req.params.user_id);
   var user_id = 	 req.params.user_id;
   req.send(200,   { "meta": { "code": 200}, "data": { "outgoing_status": "requested"  } });
}

function approvePeople(req,res,next){
   console.log('approve People by ID:',req.params.user_id);
   var user_id = 	 req.params.user_id;
   req.send(200,   { "meta": { "code": 200}, "data": { "outgoing_status": "requested"  } });
}

function denyPeople(req,res,next){
   console.log('deny People by ID:',req.params.user_id);
   var user_id = 	 req.params.user_id;
   req.send(200,   { "meta": { "code": 200}, "data": { "outgoing_status": "requested"  } });
}

/*******************************************
{
    "data": [{
        "username": "meeker",
        "first_name": "Tom",
        "profile_picture": "http://distillery.s3.amazonaws.com/profiles/profile_6623_75sq.jpg",
        "id": "6623",
        "last_name": "Meeker"
    }]
}  
********************************************/

/******************************
  GET MY FOLLOWER / FOLLOWEDBY
******************************/
	
//app.get('/follow/:id',getFollowers);
app.get('/self/follower',getMyFollowers);
app.get('/self/followedBy',getMyFollowedBy);

function getMyFollowers(req,res,next){
   console.log('getFollowers',req.params.id);
   req.send(200);
}

function getMyFollowedBy(req,res,next){
   console.log('getMyFollowedBy',req.params.id);
   req.send(200);
}

/**********************************
  GET USER'S FOLLOWER / FOLLOWEDBY
**********************************/
app.get('/profile/:id/follower',getFollower);
app.get('/profile/:id/following',getFollowing);

function getFollower(req,res,next){
    followModel.getFollowedList(req.params.id,function(err,data){
	    if(err){console.log('getFollowedList err');next(err);}
        else{
			console.log('isUnfollowedBy success'.green,data);
			res.send(data);
		}	
	})	
}

//https://localhost/profile/519985ed86e35aec15000001/following
function getFollowing(req,res,next){
    followModel.getFollowList(req.params.id,function(err,data){
	    if(err){console.log('getFollowedList err',err);next(err);}
        else{
			console.log('isUnfollowedBy success'.green,data);
			res.send(data);
		}	
	})
}

