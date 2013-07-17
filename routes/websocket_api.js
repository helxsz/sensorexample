/*********************************************

        socket.io
// http://stackoverflow.com/questions/11680997/socket-io-parse-connect-2-4-1-signed-session-cookie
// http://stackoverflow.com/questions/11709991/how-to-decode-a-cookie-secret-set-using-connects-cookiesession
// http://www.danielbaulig.de/socket-ioexpress/
https://github.com/zackster/CompassionPit--Node-/blob/master/app.js

http://blog.rstack.cc/post/node_js__using_socket_io_with_cluster_module
//http://weblog.plexobject.com/?p=1697
**********************************************/
var logger = require('../logging.js');
var config = require('../conf/config.js');
var sessionStore =  require('../app').sessionStore;

var parseCookie = require('express/node_modules/connect').utils.parseCookie;
var connect = require('express/node_modules/connect')
, parseSignedCookie = connect.utils.parseSignedCookie
, cookie = require('express/node_modules/cookie');


var user_websocket_map = exports.user_websocket_map = {};

/*
 * websockets.user_msg()
 *
 * For a given user, look up their connected web sockets and if found emit from
 * all of those.
 */
user_msg = exports.user_msg = function(user_id, msg, data)
{

  var sockets = user_websocket_map[user_id];

  if (sockets !== undefined && sockets.length > 0) {
    _.each(sockets, function(socket) {
      socket.emit(msg, data);
    });
  }

}

/*
 * add_socket()
 *
 * Adds a socket to the per-user list
 */
function add_socket(user_id, socket)
{

  var sockets = user_websocket_map[user_id];

  if (sockets === undefined) {
    user_websocket_map[user_id] = [socket];
  } else {
    sockets.push(socket);
  }
}

/*
 * remove_socket()
 *
 * Removes a socket to the per-user list
 */
function remove_socket(user_id, socket)
{

  var sockets = user_websocket_map[user_id];

  if (sockets !== undefined) {
    var msocket = _.find(sockets, function(s) {
      return s === socket;
    });
    if (msocket !== undefined) {
      sockets = _.without(sockets, msocket);
    }
  }
}

var RedisStore = require('socket.io/lib/stores/redis')
    , redis  = require('socket.io/node_modules/redis')
    , pub_io , sub_io , client_io;

function setStore(io){
	pub_io =  redis.createClient({ host: config.redis.host, port: config.redis.port}),
	sub_io =  redis.createClient({ host: config.redis.host, port: config.redis.port}), 
	client_io = redis.createClient({ host: config.redis.host, port: config.redis.port});
	
	sub_io.subscribe('chat');

	
	pub_io.auth("", function (err) { if (err) throw err; });
    sub_io.auth("", function (err) { if (err) throw err; });
    client_io.auth("", function (err) { if (err) throw err; });
	
	io.set('store', new RedisStore({
       redis    : redis
     , redisPub : pub_io
     , redisSub : sub_io
     , redisClient : client_io
    }));
}	
	


var sio = require('socket.io');
init();
exports.init = init;
// config  https://github.com/LearnBoost/socket.io/wiki/Authorizing	
function init(){
    var io = sio.listen(8082,{logger : logger, origins: '*:*', 'log level' : 0, log: false});

	//var chatServer = io.of('/chat');
   io.configure(function () {
        console.log('configure');   
      	io.set('log level', 1);
	    setStore(io);	
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

	
    io.set('authorization', function (handshakeData, callback) {
	            if(!handshakeData.headers.cookie){
			        return accept('not authorized', false);
			    } 

                var headers = handshakeData.headers;
                if (headers) {
                    var ipAddress = headers['x-forwarded-for'];
                    if (ipAddress) {
                        handshakeData.address.address = ipAddress;
                    }
                }
				
				console.log('authorization');
                //根据cookie找sessionId,https://github.com/DanielBaulig/sioe-demo/blob/master/app.js
                var signedCookies = require('express/node_modules/cookie').parse(handshakeData.headers.cookie);
                handshakeData.cookie = require('express/node_modules/connect/lib/utils').parseSignedCookies(signedCookies,config.sessionSecret);
                //根据sessionId找username
                sessionStore.get(handshakeData.cookie['express.sid'], function(err,session){
                    if(err || !session) return callback('socket.io: no found session.', false);
                    handshakeData.session = session;
                    if(handshakeData.session.uid){ 
                        return callback(null, true);
                    }else{
                        return callback('socket.io: no found session.user', false);
                    }
                })	
    });	
	
	
	io.sockets.on('connection', function(socket) {
        var session = socket.handshake.session;
        if (session.uid === undefined) {
            console.debug("Websocket connection does not have authorization - nothing to do.");
        } else {
            //add_socket(session.passport.user, socket);
			console.log(session.uid,socket.id);
			socket.emit('connect',{'id':socket.id,'uid':session.uid});//
	    }
		
		
		////////////////////////////////////////////////////////////////////////////
		//https://github.com/steffenwt/nodejs-pub-sub-chat-demo/blob/master/app_redis.js
		socket.on('chat', function (data) {
		/*
			var msg = JSON.parse(data);
			var reply = JSON.stringify({action: 'message', user: msg.user, msg: msg.msg });
			socket.emit('chat', reply);
			socket.broadcast.emit('chat', reply);
		*/	
			pub_io.publish('chat', data);
		});

		socket.on('join', function(data) {
		/*
		    var msg = JSON.parse(data);
			var reply = JSON.stringify({action: 'control', user: msg.user, msg: ' joined the channel' });
			socket.emit('chat', reply);
			socket.broadcast.emit('chat', reply);
		*/	
			pub_io.publish('chat', data);
		});
		
		sub_io.on('message', function (channel, message) {
            socket.emit(channel, message);
        });
		
		
	})
	
	
}	


//https://github.com/steffenwt/nodejs-pub-sub-chat-demo
//https://github.com/Swiftam/book-node-mongodb-backbone/blob/master/ch10/routes/chat.js
//https://github.com/jfromaniello/passport.socketio/blob/master/lib/index.js
//https://github.com/functioncallback/session.socket.io/blob/master/session.socket.io.js
//http://cnodejs.org/topic/50264c5ef767cc9a511c71b1
//https://github.com/senchalabs/connect/issues/588	
//http://blog.cloudfoundry.com/2013/01/24/scaling-real-time-apps-on-cloud-foundry-using-node-js-and-redis/	
//https://github.com/Strider-CD/strider/blob/master/lib/websockets.js#L27