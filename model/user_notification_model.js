var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;
var Schema = mongoose.Schema;
var color = require('colors');

// paged notification  + configation +subscribtion
var NotificationSchema = mongoose.Schema({
   _id:{type:String,required:true,unique:true},
   c:{type:Number,default:0}
});

var NotificationModel = mongoose.model('Notification',NotificationSchema);
/************************************
criterial   http://www.slideshare.net/mongodb/eventbased-subscription-with-mongodb   event based subscription
***************************************/
