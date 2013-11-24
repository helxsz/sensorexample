var async = require('async'),
    fs = require('fs'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
    moment = require('moment');

var app = require('../app').app,
    permissionAPI = require('./permission_api'),
    notification_api = require('./notification_api'),
    courseModel = require('../model/course_model'),
    userModel = require('../model/user_model'),
    questionModel = require('../model/question_model'),
    errors = require('../utils/errors'),
	gridfs = require("../utils/gridfs"),
	winston = require('../utils/logging.js'); 

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
