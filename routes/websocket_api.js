/*********************************************

        socket.io
// http://stackoverflow.com/questions/11680997/socket-io-parse-connect-2-4-1-signed-session-cookie
// http://stackoverflow.com/questions/11709991/how-to-decode-a-cookie-secret-set-using-connects-cookiesession
// http://www.danielbaulig.de/socket-ioexpress/
https://github.com/zackster/CompassionPit--Node-/blob/master/app.js

http://blog.rstack.cc/post/node_js__using_socket_io_with_cluster_module
//http://weblog.plexobject.com/?p=1697
**********************************************/
var app = require('../app').app;
//var https_server = require('../app').https_server;
var fs = require('fs');
var logger = require('../logging.js');
var config = require('../conf/config.js');
var sessionStore =  require('../app').sessionStore;

var parseCookie = require('express/node_modules/connect').utils.parseCookie;
var connect = require('express/node_modules/connect')
, parseSignedCookie = connect.utils.parseSignedCookie
, cookie = require('express/node_modules/cookie');

/*
 * websockets.user_msg()
 *
 * For a given user, look up their connected web sockets and if found emit from
 * all of those.
 */
 /*
 * add_socket()
 *
 * Adds a socket to the per-user list
 */
 /*
 * remove_socket()
 *
 * Removes a socket to the per-user list
 */
 
/* 
var user_websocket_map = exports.user_websocket_map = {};


user_msg = exports.user_msg = function(user_id, msg, data)
{

  var sockets = user_websocket_map[user_id];

  if (sockets !== undefined && sockets.length > 0) {
    _.each(sockets, function(socket) {
      socket.emit(msg, data);
    });
  }

}


function add_socket(user_id, socket)
{

  var sockets = user_websocket_map[user_id];

  if (sockets === undefined) {
    user_websocket_map[user_id] = [socket];
  } else {
    sockets.push(socket);
  }
}


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

// http://chrislarson.me/blog/nodejs-socketio-and-real-time-web-hmi-example
// http://chrislarson.me/blog/socketio-and-nodejs-passport-authentication
*/

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

exports.initWebsocket = initWebsocket;
// config  https://github.com/LearnBoost/socket.io/wiki/Authorizing	
function initWebsocket(https_server){
    //var io = sio.listen(8082);  //,{logger : logger, origins: '*:*', 'log level' : 0, log: false}
    var io = sio.listen(https_server,{  key:fs.readFileSync('./conf/server.key').toString(),
	                           cert:fs.readFileSync('./conf/server.crt').toString()
							});
	//var chatServer = io.of('/chat');
   io.configure(function () {
        console.log('web socket io configure'.green);   
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

	
    io.set('authorization', function (handshakeData, accept) {
	            console.log('io authorization'.green, handshakeData);
	            if(!handshakeData.headers.cookie){
				    console.log('no cookie , no authorization '.red);
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
				console.log('session sid cookie'.green,handshakeData.cookie['express.sid']);
                sessionStore.get(handshakeData.cookie['express.sid'], function(err,session){
                    if(err || !session) return accept('socket.io: no found session.', false);
                    handshakeData.session = session;
                    if(handshakeData.session.uid){ 
					    console.log('socket.io: found session.user'.green,handshakeData.session.uid);
                        return accept(null, true);
                    }else{
					    console.log('socket.io: no found session.user'.red);
                        return accept('socket.io: no found session.user', false);
                    }
                })	
    });	
	
	////////////////////////////////////////////////////////////////////////////
	//https://github.com/steffenwt/nodejs-pub-sub-chat-demo/blob/master/app_redis.js	
	
	// 通过users list找到一堆user id，得到user id，可以得到user socket id，
	
	io.sockets.on('connection', function(socket) {
        var session = socket.handshake.session;
        if (session.uid === undefined) {
            console.debug("Websocket connection does not have authorization - nothing to do.");
        } else {
            //add_socket(session.passport.user, socket);
			console.log('connection   ',session.uid,socket.id);
			socket.uid = session.uid;
			socket.emit('connect',{'id':socket.id,'uid':session.uid});//
			
			var socketID = socket.id, userID = socket.uid;
			//////////////////////
			setUserSocket(userID, socketID, socket);
			//////////////////////
			addSocketAndUserToList(userID, socketID); 
	    }
				
        /**/		
		//////////////////////////////////////////////////////////////////////////////
		socket.on('disconnect', clientRequestLeave);
		function clientRequestLeave(){
		    console.log("leave  ",socket.id,socket.uid);
		    //
			var socketID = socket.id, userID = socket.uid;
			
			
            removeUserSocket(userID);
			// remove socket id from socket list
			removeSocketAndUserFromList(userID, socketID);		
						
			io.sockets.in("help").emit('user leave', {
			    'uid':socket.uid
			});
			
			/*
			// remove user from room
            client.srem('helps:' + socket.uid , uid, function(err, removed) {
                if (removed) {
                  client.hincrby('rooms:' + room_id + ':info', 'online', -1);
                  // chatlogWriteStream.destroySoon();
				  var room_id = "room_id";
                  io.sockets.in(room_id).emit('user leave', {

                  });
                }
            });
            */			
		}

        /**********************************
		*****   ask tutor for help   ******
		**********************************/		
		socket.on('history request', clientRequestHistory);
		socket.on('help request', clientRequestHelp);
		socket.on('tutor request', tutorRequest);
		socket.on('msg request', clientSendMsg);	
		
		function tutorRequest(data){
		    console.log('tutorRequest from ',socket.uid,socket.id);
		
		}
		
		function clientRequestHistory(data){
		    console.log('receive history request from ',socket.uid,socket.id);
			var history = [];
			socket.emit('history response', {
                history: history
            });
		}
		
		function clientRequestHelp(data){
		    console.log('receive help request from ',socket.uid,socket.id);
		    var msg = JSON.parse(data);
			console.log(data,"    ",msg);
		    console.log('receive help request',msg.tid,msg.uid,msg.room);
			socket.join("help");
			io.sockets.in("help").emit('new user', {
			    'uid':socket.uid
			});
			/*
                client.sadd('rooms:' + socket.uid , socket.uid, function(err, userAdded) {
                    if(userAdded) {
                        client.hincrby('rooms:' + room_id + ':info', 'online', 1);
                            
                        io.sockets.in(room_id).emit('new user', {
                                    nickname: nickname,
                                    provider: provider,
                                    status: status || 'available'
                        });
                            
                     }
                });				
			*/
			// and send mssage to tutor
		}
		
		
		function clientSendMsg(data){
		    console.log('receive msg request from ',socket.uid,socket.id);
			io.sockets.in("help").emit('msg', {
			    'uid':socket.uid
			});			
		  /*
			var msg = JSON.parse(data);
			var reply = JSON.stringify({action: 'message', user: msg.user, msg: msg.msg });
			socket.emit('chat', reply);
			socket.broadcast.emit('chat', reply);
			
		    var room_id = "room_id";
			pub_io.publish('chat', data);	
            io.sockets.in(room_id).emit('msg', {
              //nickname: nickname,
              //provider: provider,
              //msg: data.msg
            });	
          */			
		}
        /**********************************
		*****   student share code   ******
		**********************************/
        socket.on('code view', clientCodeView);
        function clientCodeView(data){  //{"uid":uid,"room":room,"code":code}
            console.log('receive clientCodeView ',data.uid,data.room,data.code);
			io.sockets.in("help").emit('code view', {
			    'uid':data.uid, 'code':data.room
			});			
        }
        /**********************************
		*****   tutor gives advice   ******
		**********************************/
        socket.on('code snippet', tutorCodeSnippet);   
		socket.on('code comment', tutorCodeComment);
        function tutorCodeSnippet(data){  // {"uid":uid,"room":room,"code":code}
            console.log('receive tutorCodeSnippet ',data.uid,data.room, data.room, data.code);
			io.sockets.in("help").emit('code snippet', {
			    'uid':data.uid, 'code':data.room
			});			
        }		
        
        function tutorCodeComment(data){  //  {"uid":uid,"room":room,"comment":comment,"line_num":codeline}
            console.log('receive tutorCodeComment ',data.uid,data.room, data.room, data.comment, data.line_num);
			io.sockets.in("help").emit('code comment', {
			    'uid':data.uid, 'comment':data.comment, "line_num":data.line_num
			});			
        }		
        /**********************************
		*****   room join/ disjoin   ******
		**********************************/
		socket.on('join', clientRequestJoin);
		socket.on('disjoin',clientRequestDisjoin)
		function clientRequestJoin(data){
		   /*
		    var msg = JSON.parse(data);
			var reply = JSON.stringify({action: 'control', user: msg.user, msg: ' joined the channel' });
			socket.emit('chat', reply);
			socket.broadcast.emit('chat', reply);
		   */	
			pub_io.publish('chat', data);				
		}
        function clientRequestDisjoin(data){
		
		}		
		/*
		sub_io.on('message', function (channel, message) {
            socket.emit(channel, message);
        });
		*/
		
	})
	
	
}

// redis mset, set , get , mget , hset, hget , hmset , hmget

function addSocketAndUserToList(userID, socketID){
		    client_io.sadd('sockets', socketID, function(err, socketAdded){
		        if(socketAdded) {
			        console.log('sockets added  '.green,socketID);
			        client_io.sadd('users', userID, function(err, userAdded){
		                if(userAdded) {
			                console.log('user added  '.green,userID);
		                } 
		            });					
		        }
		    });	    
}

function removeSocketAndUserFromList(userID, socketID){
		    client_io.srem('sockets', socketID, function(err, removed){
                console.log('sockets removed '.green, socketID);			
		        // remove user id from user list
			    client_io.srem('users', userID,function(err, userRemoved){
		            if(userRemoved) {
			            console.log('user removed  '.green,userID);
		            } 
		        });									
			});    
}

/*******************************************************************************

*******************************************************************************/

var socketObjArray = {};
function getUserSocket(userID,callback){
    client_io.get('user:'+userID, function(err,data){	
	    var socketID = data;
		if(socketID !=null){
		    var obj = socketObjArray[socketID];
		    if(obj) { 
		        console.log('socket Obj found -'.green, userID, '   ');  
			    //return obj;
                callback(null,obj);				
		    }
		    else {
			    console.log('not socket Obj found  -'.red,userID);
				callback({err:'no socket obj'},null);
			}
		}else{
		    console.log('no socketID found -'.red, userID);
			callback({err:'no socket'},null);
		}
	});
}	



function setUserSocket(userID, socketID, socketObj){
    socketObjArray[socketID] = socketObj;
	client_io.mset('user:'+userID,socketID,redis.print);
}

function removeUserSocket(userID){
    client_io.get('user:'+userID, function(err,data){
	    if(data){
		    socketID = data;
		    var socketObj = socketObjArray[socketID];
			if(socketObj) {
			   socketObjArray[socketID] = null;
			   delete socketObj;
			   console.log('remove user socket success'.green);
			}
			client_io.del('user:'+userID,function(err,data){
			   if(data==1) console.log('delete user id',userID ,' successful ');
			});
		}else{
		    console.log('can not search userID',userID);
		}	    
	})
}

function sendMsgToUserSocket(userID, data, callback){

    getUserSocket(userID,function(err,socket){
	    if(err){
		    console.log(' can not get user socket '.red,err);
			callback('err',null);
		}else if(data){		
		    console.log('get user socket',socket.id);
			// how to ensure socket send out the message
			socket.emit('noti', JSON.stringify(data));
			callback(null,'success');
		}	
	})
}

exports.getUserSocket = getUserSocket;
exports.sendMsgToUserSocket = sendMsgToUserSocket;




var testRedis = function(){
    for(var i=0;i<100;i++)
    setUserSocket('user'+i,'socket'+i,'socket'+i+'_Obj');
	
	getUserSocket('user'+2,function(err,data){});
	getUserSocket('user'+99,function(err,data){});
	getUserSocket('user'+101,function(err,data){});
    
	for(var i=0;i<100;i++)
	removeUserSocket('user'+i);
}

//setTimeout(function(){ testRedis();}  , 4000);


//https://github.com/steffenwt/nodejs-pub-sub-chat-demo
//https://github.com/Swiftam/book-node-mongodb-backbone/blob/master/ch10/routes/chat.js
//https://github.com/jfromaniello/passport.socketio/blob/master/lib/index.js
//https://github.com/functioncallback/session.socket.io/blob/master/session.socket.io.js
//http://cnodejs.org/topic/50264c5ef767cc9a511c71b1
//https://github.com/senchalabs/connect/issues/588	
//http://blog.cloudfoundry.com/2013/01/24/scaling-real-time-apps-on-cloud-foundry-using-node-js-and-redis/	
//https://github.com/Strider-CD/strider/blob/master/lib/websockets.js#L27

/*
  // Delete all users sockets from their lists
  client.keys('sockets:for:*', function(err, keys) {
    if(keys.length) client.del(keys);
    console.log('Deletion of sockets reference for each user >> ', err || "Done!");
  });

  // No one is online when starting up
  client.keys('rooms:*:online', function(err, keys) {
    var roomNames = [];
    
    if(keys.length) {
      roomNames = roomNames.concat(keys);
      client.del(keys);
    }

    roomNames.forEach(function(roomName, index) {
      var key = roomName.replace(':online', ':info');
      client.hset(key, 'online', 0);
    });

    console.log('Deletion of online users from rooms >> ', err || "Done!");
  });

  // Delete all socket.io's sockets data from Redis
  client.smembers('socketio:sockets', function(err, sockets) {
    if(sockets.length) client.del(sockets);
    console.log('Deletion of socket.io stored sockets data >> ', err || "Done!");
  });





exports.genRoomKey = function() {
  var shasum = crypto.createHash('sha1');
  shasum.update(Date.now().toString());
  return shasum.digest('hex').substr(0,6);
};

*/

/*
 * Room name is valid


exports.validRoomName = function(req, res, fn) {
  req.body.room_name = req.body.room_name.trim();
  var nameLen = req.body.room_name.length;

  if(nameLen < 255 && nameLen >0) {
    fn();
  } else {
    res.redirect('back');
  }
};


 */
/*
 * Checks if room exists

exports.roomExists = function(req, res, client, fn) {
  client.hget('balloons:rooms:keys', encodeURIComponent(req.body.room_name), function(err, roomKey) {
    if(!err && roomKey) {
      res.redirect( '/' + roomKey );
    } else {
      fn()
    }
  });
};

 */


/*
 * Creates a room
      
exports.createRoom = function(req, res, client) {
  var roomKey = exports.genRoomKey()
    , room = {
        key: roomKey,
        name: req.body.room_name,
        admin: req.user.provider + ":" + req.user.username,
        locked: 0,
        online: 0
      };

  client.hmset('rooms:' + roomKey + ':info', room, function(err, ok) {
    if(!err && ok) {
      client.hset('balloons:rooms:keys', encodeURIComponent(req.body.room_name), roomKey);
      client.sadd('balloons:public:rooms', roomKey);
      res.redirect('/' + roomKey);
    } else {
      res.send(500);
    }
  });
};

 */ 


/*
 * Get Room Info


exports.getRoomInfo = function(req, res, client, fn) { 
  client.hgetall('rooms:' + req.params.id + ':info', function(err, room) {
    if(!err && room && Object.keys(room).length) fn(room);
    else res.redirect('back');
  });
};

exports.getPublicRoomsInfo = function(client, fn) {
  client.smembers('balloons:public:rooms', function(err, publicRooms) {
    var rooms = []
      , len = publicRooms.length;
    if(!len) fn([]);

    publicRooms.sort(exports.caseInsensitiveSort);

    publicRooms.forEach(function(roomKey, index) {
      client.hgetall('rooms:' + roomKey + ':info', function(err, room) {
        // prevent for a room info deleted before this check
        if(!err && room && Object.keys(room).length) {
          // add room info
          rooms.push({
            key: room.key || room.name, // temp
            name: room.name,
            online: room.online || 0
          });

          // check if last room
          if(rooms.length == len) fn(rooms);
        } else {
          // reduce check length
          len -= 1;
        }
      });
    });
  });
};
 */



/*
 * Get connected users at room


exports.getUsersInRoom = function(req, res, client, room, fn) {
  client.smembers('rooms:' + req.params.id + ':online', function(err, online_users) {
    var users = [];

    online_users.forEach(function(userKey, index) {
      client.get('users:' + userKey + ':status', function(err, status) {
        var msnData = userKey.split(':')
          , username = msnData.length > 1 ? msnData[1] : msnData[0]
          , provider = msnData.length > 1 ? msnData[0] : "twitter";

        users.push({
            username: username,
            provider: provider,
            status: status || 'available'
        });
      });
    });

    fn(users);

  });
};

 */

/*
 * Get public rooms


exports.getPublicRooms = function(client, fn){
  client.smembers("balloons:public:rooms", function(err, rooms) {
    if (!err && rooms) fn(rooms);
    else fn([]);
  });
};

 */

/*
 * Get User status


exports.getUserStatus = function(user, client, fn){
  client.get('users:' + user.provider + ":" + user.username + ':status', function(err, status) {
    if (!err && status) fn(status);
    else fn('available');
  });
};
 */
/*
 * Enter to a room


exports.enterRoom = function(req, res, room, users, rooms, status){
  res.locals({
    room: room,
    rooms: rooms,
    user: {
      nickname: req.user.username,
      provider: req.user.provider,
      status: status
    },
    users_list: users
  });
  res.render('room');
};

 */