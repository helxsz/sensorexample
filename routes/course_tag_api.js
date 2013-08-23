var app = require('../app').app;
var courseModel = require('../model/course_model');
var userModel = require('../model/user_model');
var questionModel = require('../model/question_model');
var	gridfs = require("./gridfs");

var async = require('async');
var fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');
var permissionAPI = require('./permission_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

var Hashids = require("hashids"),
    hashids = new Hashids("this is my salt");
	
var notification_api = require('./notification_api');
	
var errors = require('../utils/errors');	

app.get('/tags/search',getSimilarByTag);
app.get('/tags/:tag',getTagByName);
app.get('/tags/:tag/recent',getRecentByTag);


/*
{
"data": [
        {
            "media_count": 43590,
            "name": "snowy"
        },
        {
            "media_count": 3264,
            "name": "snowyday"
        }
]}		
*/
function getSimilarByTag(req,res,next){
    console.log(req.query.type,req.query.tag);
}


/*
{
    "data": {
        "media_count": 472,
        "name": "nofilter",
    }
}
*/
function getTagByName(req,res,next){
    console.log(req.params.tag);
	
}



function getRecentByTag(req,res,next){

}
