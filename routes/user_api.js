var crypto = require('crypto'),
    fs = require('fs'),
	color = require('colors'),
    moment = require('moment'),
    async = require('async'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

var app = require('../app').app,
    GridFS = require('../app').GridFS,
    userModel = require('../model/user_model'),
    config = require('../conf/config.js'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js');  
	
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
