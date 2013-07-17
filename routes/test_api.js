var app = require('../app').app;
var courseModel = require('../model/course_model');
var userModel = require('../model/user_model');
var questionModel = require('../model/question_model');
var	gridfs = require("./gridfs");
var config = require('../conf/config.js');
var async = require('async');
var  redis = require('redis'),fs = require('fs');
require('colors');
var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');	
var moment = require('moment');
var account_api = require('./account_api');

var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;

//http://creatary.com/documentation/getting-started/tutorials/7-nodejs-parking-app
//https://github.com/IshaiJaffe/nodejs-admin/blob/master/permissions.js
/*********************************************************
                    queue 
*********************************************************/
var kue = require('kue'),
	Job = kue.Job;
var jobs = kue.createQueue();
/*
kue.redis.createClient = function() {
    var client = redis.createClient(1234, '192.168.1.2');
    client.auth('password');
    return client;
 };
*/
//jobs.promote();
//processQueue();

function processQueue(){
// http://my.oschina.net/u/568264/blog/120854
//http://functionsource.com/post/kue-a-successful-messaging-framework
//http://stackoverflow.com/questions/14950777/kue-callback-when-job-is-completed
//http://stackoverflow.com/questions/15338820/node-js-kue-worker-send-result    
    var minute = 60000;

    var email = jobs.create('email', {
      title: 'Account renewal required'
      , to: 'tj@learnboost.com'
      , template: 'renewal-email'
    })
      .priority('high')
      .save();

    email.on('promotion', function(){
        console.log('email job promoted');
    }).on('complete', function(){
        console.log('email job completed');
    }).on('failed', function(){
        console.log(" email failed");
    }).on('progress', function(progress){
     
    });
	
    jobs.create('video conversion', {
      title: 'converting   s to avi'
      , user: 1
      , frames: 200
      })
	.save()
	.on('promotion', function(){
        console.log('video job promoted');
    }).on('complete', function(){
        console.log('video job completed');
    }).on('failed', function(){
        console.log(" video failed");
    }).on('progress', function(progress){
     
    });;	
	
    ///////////////////////      queuue            ///////////////////////////////////////// 
    /*	
    jobs.on('failed', function(id) {
        Job.get(id, function(err, job){
		   console.log('job complete',job.id);
           job.state('inactive').save();	
      });	
	}
	*/
	
    jobs.on('job complete', function(id){
        Job.get(id, function(err, job){
		   console.log('job complete',job.id);
		  /*
            if (err) return;
            job.remove(function(err){
                if (err) throw err;
                 console.log('removed completed job #%d', job.id);
            });
		  */	
      });
    });	
		
	jobs.process('video conversion', 2, function(job, done){
        console.log('process video');
        setTimeout(done, Math.random() * 5000);
    });
	
    jobs.process('email', function(job, done){
        console.log('process email');
		 setTimeout(done, Math.random() * 3000);
    });	

}



/****************************************************

*****************************************************/
var redis_ip= config.redis.host;  
var redis_port= config.redis.port; 
var redisClient2 = redis.createClient(redis_port,redis_ip); 
/*
redisClient2.flushdb(function(){console.log('flushdb'.red);}); 
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':1}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':2}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':3}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':3}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':4}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':6}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':7}   ));
redisClient2.lpush('media:objects', JSON.stringify(  {'abc':8}   ));
redisClient2.ltrim('media:objects', 1,-1);
*/


setTimeout(function(){

  redisClient2.lrange('media:objects', 0, -1, function(error, media){
	    // Parse each media JSON to send to callback
	    media = media.map(function(json){return JSON.parse(json);});
		//console.log(media);
  });
  
  redisClient2.llen('media:objects',function(err,data){
       console.log(data);
  }) 
},2000);












app.get('/city',function(req,res,next){
    console.log('city  ',req.query.query);
	res.send(200,[
       {id: 1, value: 'item1'},
       {id: 2, value: 'item2'},
       {id: 3, value: 'item3'}
    ]);  
});

//https://gist.github.com/epeli/1158171
//https://github.com/JonAbrams/node-shorty/blob/master/src/main.coffee
var DICTIONARY = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(''); 
function encode(i) {
    if (i == 0) 
	return DICTIONARY[0];
    var result = '';
    var base = DICTIONARY.length; 
    while (i > 0) {
	result += DICTIONARY[(i % base)];
	i = Math.floor(i / base);
    }    
    return result.split("").reverse().join("");
}

function decode(input) {
    var i = 0;
    var base = DICTIONARY.length;
    input.split("").forEach(function(c){
	i = i * base + DICTIONARY.indexOf(c);
    });
    return i;
} 
 


/*****************
https://github.com/postwait/node-amqp
https://github.com/jamescarr/nodejs-amqp-example/network
https://github.com/cloudamqp/nodejs-amqp-example/blob/master/app.js
https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/javascript-nodejs
http://stackoverflow.com/questions/13071734/express-socket-io-rabbitmq-node-amqp
http://www.matt-knight.co.uk/2011/message-queues-in-node-js/
*****************/
/*
var amqp = require('amqp');
var option = { host: 'datafeeds.networkrail.co.uk', port: 61618, login: 'Jordy@connectedliverpool.co.uk', password: 'Newyork%212+'};
//var client = new StompClient('datafeeds.networkrail.co.uk', 61618, 'Jordy@connectedliverpool.co.uk', 'Newyork%212+', '1.0');

var TRAIN_MVT_HE_TOC = '/topic/TRAIN_MVT_HE_TOC';
var implOpts = {
      reconnect: true,
      reconnectBackoffStrategy: 'exponential',
      reconnectBackoffTime: 500
};
//{defaultExchangeName: "amq.topic"}
var connection  = amqp.createConnection(option,implOpts);
connection.addListener('ready', function(){
    console.log('ready connection ');

    var exchange = connection.exchange(TRAIN_MVT_HE_TOC,{type: TRAIN_MVT_HE_TOC, durable: true});
    var queue = connection.queue(TRAIN_MVT_HE_TOC, function (queue) {
        console.log('Queue ' + queue.name + ' is open');
    });
    //queue.bind('some-exchange', 'key.b.a')
	queue.bind(exchange,'#');
    queue.subscribe( {ack:true}, function(message){
        console.log(message.data.toString());
        queue.shift();
    });

});

connection.on('error', function (error) {
    console.log('Connection error fuck fuck' + error.toString(),error);

});

connection.on('close', function () {
    console.log('Connection close ');

}); 
var done = function (error) {
        if (exchange) {
          exchange.destroy();
        }
        if (queue) {
          queue.destroy();
        }
        if (error) {
          // Exit loudly.
          console.log('Error: "' + error + '", abandoning test cycle');
          throw error;
        } else {
          console.log('All done!');
          // Exit gracefully.
          connection.setImplOptions({'reconnect': false});
          connection.destroy();
        }
        exit = true;
}
*/

/***********************************

var actorTypes = ['Person', 'Group', 'Application', 'Service'];
    var objectTypes = ['Photo', 'Application', 'Instance', 'Article', 'Person', 'Place', 'Service', 'Comment'];
    var verbs = ['Post', 'Favorite', 'Follow', 'Join', 'Like', 'Friend', 'Play', 'Save', 'Share', 'Tag', 'Create', 'Update', 'Read', 'Delete', 'Check In', 'Like'];

http://stackoverflow.com/questions/8660834/scalable-push-application-with-node-js
http://stackoverflow.com/questions/10647969/modelling-blogs-and-ratings-in-mongodb-and-nodejs
http://stackoverflow.com/questions/7046462/best-way-to-model-a-voting-system-in-mongodb?rq=1
http://stackoverflow.com/questions/5224811/mongodb-schema-design-for-blogs?rq=1
http://programmers.stackexchange.com/questions/167109/what-is-the-recommended-mongodb-schema-for-this-quiz-engine-scenario
http://stackoverflow.com/questions/5739357/how-to-reuse-redis-connection-in-socket-io



Using:

A regular MongoDB Collection as the Store,
A MongoDB Capped Collection with Tailable Cursors as the Queue,
A Node worker with Socket.IO watching the Queue as the Worker,
A Node server to serve the page with the Socket.IO client, and to receive POSTed data (or however else the data gets added) as the Server
It goes like:

The new data gets sent to the Server,
The Server puts the data in the Store,
The Server adds the data's ObjectID to the Queue,
The Queue will send the newly arrived ObjectID to the open Tailable Cursor on the Worker,
The Worker goes and gets the actual data in the ObjectID from the Store,
The Worker emits the data through the socket,
The client receives the data from the socket.
This is 'push' from the initial addition of the data all the way to receipt at the client - no polling, so as real-time as you can get given the processing time at each step.
https://github.com/LearnBoost/kue

https://github.com/andrewtennison/startup-boilerplate
https://github.com/addyosmani/backbone-boilerplates
https://github.com/mape/node-express-boilerplate
http://blog.cloudfoundry.com/2012/05/17/node-activity-streams-app-1/
https://github.com/ciberch/activity-streams-mongoose

http://blog.cloudfoundry.com/2013/01/24/scaling-real-time-apps-on-cloud-foundry-using-node-js-and-redis/
http://blog.cloudfoundry.com/2013/01/31/scaling-real-time-apps-on-cloud-foundry-using-node-js-and-rabbitmq/
http://blog.cloudfoundry.com/2012/09/11/node-activity-streams-app-3/
https://github.com/cloudfoundry-samples/node-activities-boilerplate

https://github.com/rajaraodv

http://engineering.linkedin.com/nodejs/blazing-fast-nodejs-10-performance-tips-linkedin-mobile
************************************/

/**********************************************************
var db = redis.createClient(9281, 'goosefish.redistogo.com');
db.auth('dc64f7b818f4e3ec2e3d3d033e3e5ff4', function(result) {
	console.log("goosefish authenticated.");  
})
db.on("error", function (err) {  
     console.log("goosefish Error " + err);  
     return false;  
});    

db.on('connect',function(err){
	console.log('goosefish connect success');
})

db.subscribe("flight_stream");

db.on("message", function (channel, message) {
	try { var flight = JSON.parse(message); }
	catch (SyntaxError) { return false; }
    console.log(flight);
	if ( flight.origin.iata == "BOS" || flight.destination.iata == "BOS") {
		
	}
});
************************************************************/
/********************************************************
video
https://github.com/fukaoi/node-video-upload
https://github.com/SteveSanderson/nodejs-webmatrix-video-tutorials
http://stackoverflow.com/questions/3955103/streaming-audio-from-a-node-js-server-to-html5-audio-tag
http://blog.dojchinovski.mk/?p=41
https://github.com/fent/node-youtube-dl
https://github.com/jbochi/gifstreaming
https://github.com/schaermu/node-fluent-ffmpeg
https://github.com/nulltask/vidchat

***********************************************************/


/*********************************************************
redis
node-url-shortener
https://github.com/Jay-Oh-eN/TweetMap#readme
https://github.com/noise/SockJSTests/blob/e16de92be2b753d25c5b96aaaae2a32ffe1c41a7/notification.js
https://github.com/zdwalter/retwis-js-node-express/blob/master/app.js
*****************

http://blogs.igalia.com/jfernandez/2012/12/19/node-js-socket-io-real-time-io/     https://github.com/javifernandez/monitoring
http://weblog.plexobject.com/?p=1697
******************************************/


/***********************************************************
device registration notification
https://github.com/thisandagain/rodeo/tree/master/lib
https://github.com/sjlu/message
https://github.com/bradhowes/notifier
https://github.com/helxsz/node-apn-server
*************************************************************/


/************************************************************
real time
https://github.com/nodesocket/quote-stream
https://github.com/defly/tweereal
https://github.com/mozilla/towtruck


https://github.com/fyhao/Real-time-video-sharing-built-on-nowJS-and-Node.JS
https://github.com/mongolab/demo-node-01
https://github.com/bensheldon/consensus-wall/blob/master/server.js
https://github.com/jzarka/sgbusmap
https://github.com/lewisandclark/screens/blob/master/config/app.js
https://github.com/chadhutchins/node-trends
https://github.com/makeusabrew/goursome
https://github.com/pablomolnar/instaflow

audio
https://github.com/mnordine/live_audio
https://github.com/sksmatt/nodejs-ableton-piano
https://github.com/MemoryOverflow/Hangman.io
https://github.com/elegant651/bpharmony

sensor
https://github.com/alanreid/Sensitive/blob/master/sensitive.js
https://github.com/robrighter/node-currentcost
device
https://github.com/carbonaro/thingies/blob/master/app.js


wiki
http://inkdroid.org/journal/2011/11/07/an-ode-to-node/

chat 
https://github.com/wbecker/chattrr

redis knox
https://github.com/wookiehangover/node-gifly/tree/master/models
https://gist.github.com/dvbportal/1745223#file-redis-counters-js
**************************************************************/


/*******************************************************************

data analysis
https://github.com/charsyam/redis-stat

https://github.com/Swiftam/book-node-mongodb-backbone/tree/master/ch09

pubsub mongodb
http://cloudcomputing.blognhanh.com/2012/08/pubsub-with-mongodb.html

cluster
http://cjihrig.com/blog/scaling-node-js-applications/

http://blog.fogcreek.com/the-trello-tech-stack/

redis queue/ notfication
http://davidmarquis.posterous.com/reliable-delivery-message-queues-with-redis
http://www.devco.net/archives/2013/01/06/solving-monitoring-state-storage-problems-using-redis.php

good app
https://github.com/Strider-CD/strider


// redis pool
https://gist.github.com/tokumine/1021680
********************************************************************/



/*******************************************************************

  app  http://training.bocoup.com/classes/
  
  
https://github.com/gnawhleinad/lumberjack/tree/master/app/controllers
https://github.com/themeskult/wp-svbtle-editor-node-js


course 
https://github.com/sleeplessinc/fc/blob/master/models.js
https://github.com/codejoust/livewrite/blob/master/routes/index.js  


http://revdancatt.com/2013/03/01/notes-on-the-3d-landscape-code-and-node-js/
*******************************************************************/


/*******************************************************************
http://codepen.io/mnafricano/pen/ltKvy
http://codepen.io/juliendargelos/pen/BEdba
http://codepen.io/28inch/pen/omDbC
http://codepen.io/joacimnilsson/pen/jqsmK
http://codepen.io/katmai7/pen/gcxEa
http://cssdeck.com/labs/li7ltd8g
http://cssdeck.com/labs/progress-bar
http://cssdeck.com/labs/qvcmqfbh
http://cssdeck.com/labs/coderwall-like-pricing
http://cssdeck.com/labs/animated-dashboard-widget
http://cssdeck.com/labs/christmas-button
http://cssdeck.com/labs/switch-with-transitions
http://cssdeck.com/labs/mlhjoale

list
http://cssdeck.com/labs/little-todo-list
http://cssdeck.com/labs/simple-css-todo-list

3d
http://cssdeck.com/labs/pure-css-pin
http://cssdeck.com/labs/single-element-pointer

social
http://cssdeck.com/labs/jjrjg1bc

switch
http://cssdeck.com/labs/a-simple-css-switch
http://cssdeck.com/labs/smooth-ui-radio-checkboxes-kit
http://cssdeck.com/labs/pure-css-ui-elements
http://cssdeck.com/labs/switch-with-transitions

ui
http://cssdeck.com/labs/qhbreagg
http://cssdeck.com/labs/css-shopping-cart-checkout-basket-details-animated
http://cssdeck.com/labs/css3-instagram-button
http://cssdeck.com/labs/animated-music-player-in-css3
http://cssdeck.com/labs/user-picture-with-hidden-treasure
http://cssdeck.com/labs/itunes-10-storage-bar
http://cssdeck.com/labs/modal-box-contact-form

http://cssdeck.com/labs/timeline-style-blog-comments-revamp
http://cssdeck.com/labs/pure-css3-smooth-ribbon-with-borders
http://cssdeck.com/labs/time-ticker

http://cssdeck.com/user/items/joshnh/3

css cloud
http://cssdeck.com/labs/clouds
http://cssdeck.com/labs/minimalistic-camera-icon
http://cssdeck.com/labs/css3-envelope

loader
http://cssdeck.com/labs/colourful-css-loader

http://css-tricks.com/expanding-images-html5/
http://css-tricks.com/pop-hovers/
http://css-tricks.com/examples/DragAvatar/
http://css-tricks.com/examples/SeminarRegTutorial/
http://css-tricks.com/examples/ViewSourceButton/#
http://css-tricks.com/examples/EditableInvoice/http://css-tricks.com/examples/PopFromTopMessage/
http://www.berriart.com/sidr/
http://spyrestudios.com/demos/flickr-fields/
http://tympanus.net/Tutorials/CSSButtonsPseudoElements/index5.html#
http://www.invisionapp.com/tour
http://proto.io/
http://css-tricks.com/examples/RangeBubble/
http://dabblet.com/
http://codepen.io/juanbrujo/full/yGpAK
http://tympanus.net/Development/Stapel/
http://redis.io/topics/twitter-clonehttp://blog.cloudfoundry.com/2012/09/11/node-activity-streams-app-3/
*******************************************************************/


/********************

file:///D:/6/dos/SSL/REST%20authentication%20and%20exposing%20the%20API%20key%20-%20Stack%20Overflow.htm
file:///D:/6/dos/SSL/javascript%20-%20Securing%20my%20Node.js%20app's%20REST%20API%20%20-%20Stack%20Overflow.htm
file:///D:/6/dos/SSL/node.js%20-%20How%20to%20design%20API%20with%20no%20SSL%20support%20%20-%20Stack%20Overflow.htm
http://stackoverflow.com/questions/469161/how-do-you-define-a-good-or-bad-api
http://stackoverflow.com/questions/7039110/web-api-design-tips
http://stackoverflow.com/questions/4745699/what-is-oauth-authentication
http://www.thebuzzmedia.com/designing-a-secure-rest-api-without-oauth-authentication/


http://0xdabbad00.com/2013/01/29/things-ive-learned-using-skulpt-for-in-browser-python-code/
https://github.com/bnmnetp/skulpt
http://repl.it/IpU
*********************/