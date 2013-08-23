var app = require('../app').app;
var GridFS = require('../app').GridFS

var userModel = require('../model/user_model');
var config = require('../conf/config.js');
var	gridfs = require("./gridfs");

var crypto = require('crypto');
var fs = require('fs');

var moment = require('moment');
require('colors');
var async = require('async');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
	
	
	
/*******************************************
  search tutor    
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
app.get('/users/search/tutor',searchTutor);
function searchTutor(req,res,next){

   console.log('searchUser',req.query.name);
   req.send(200);
}


app.get('/users/popular/tutor',getPopularTutor);
function getPopularTutor(req,res,next){
   req.send(200);
}
