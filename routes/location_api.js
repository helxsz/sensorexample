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


app.get('/locations/:location_id',getLocationByID);
app.get('/locations/search',searchLocation);

/**************
{
    "data": {
        "id": "1",
        "name": "Dogpatch Labs"
        "latitude": 37.782,
        "longitude": -122.387,
    }
}
***************/
function getLocationByID(req,res,next){
   var location_id = req.params.location_id;
   console.log(location_id);
}

/**************
{
    "data": [{
        "id": "788029",
        "latitude": 48.858844300000001,
        "longitude": 2.2943506,
        "name": "Eiffel Tower, Paris"
    }]
}
**************/
function searchLocation(req,res,next){
   var lat = req.query.lat,lng = req.query.lng, dis = req.query.dis;
   console.log(lat,lng,dis);
}




/********************************************************

     get the course/tutor of one location

*********************************************************/
app.get('/locations/:location_id/course',getRecentCourseInLocation);
app.get('/locations/:location_id/tutor',getRecentTutorInLocation);
function getRecentCourseInLocation(req,res,next){
   var location_id = req.params.location_id;
   console.log(location_id);
}

function getRecentTutorInLocation(req,res,next){
   var location_id = req.params.location_id;
   console.log(location_id);
}