var util = require('util'),
	path = require('path'),
    fs = require('fs'),
    async = require('async'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto'),
	mqtt = require('mqtt'),
	socket = require('socket.io');
	
var app = require('../app').app,
    gridfs = require("./gridfs"),
    logger = require('../logging.js'),
    config = require('../conf/config.js');


app.get('/lab/mqtt',function(req,res,next){

    res.render('lab/mqtt/app');
})	
	
	
//var mqttclient = mqtt.createClient(1883, "localhost");  //dev.rabbitmq.com  
var mqttclient = mqtt.createClient(1883, "test.mosquitto.org");

mqttclient.on('connect', function(){
    console.log('MQTT Connected'.green, new Date());
	mqttclient.subscribe('de/warnings/#');
});
// how do I know if the client linked to it or not


var io = socket.listen(3000);
io.configure(function () {
        console.log('web socket io configure'.green);   
      	io.set('log level', 1);
	    //setStore(io);	
	    io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip'); 
	    io.set('heartbeat interval', 45);
    	io.set('heartbeat timeout', 120); 
    	io.set('polling duration', 20);
	
        io.set('close timeout', 60*60*24); // 24h time out
    	io.set('transports', [
            'websocket', 'xhr-polling'
            //'xhr-polling' // for benchmarking
       ]);	
});
// Subscribe to topic
io.sockets.on('connection', function (socket) {
    socket.on('subscribe', function (data) {
        mqttclient.subscribe(data.topic);
    });
	
	socket.on('sendImage', function (data) {
        // console.log(data);
        socket.broadcast.emit('getImage',data);
    });
});


//mqttclient.end();
mqttclient.on('message', function (topic, message) {
        console.log('mqtt message'.green,  message, "    ",new Date());
		io.sockets.emit('mqtt',
           {   'topic'  : topic,
              'payload' : message
           }
        );
});

/*
function testMqtt(){
    var mqttclient = mqtt.createClient(1883, "localhost");  //dev.rabbitmq.com   test.mosquitto.org
	console.log('mqtt');
    //client.subscribe('de/warnings');
    mqttclient.publish('de/warnings', 'Hello mqtt');
    mqttclient.end();
}

//setTimeout(function(){ testMqtt();}  , 4000);
//setInterval(function(){ testMqtt();}  , 4000);
*/