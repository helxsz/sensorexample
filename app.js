var fs = require('fs');
var express = require('express');
var http = require('http');
var domain = require('domain');
var crypto = require('crypto');
var https = require('https');
var passport = require('passport');
var app = express();
var ejs =  require('ejs');
var path = require('path');
var winston = require('winston');
var config = require('./conf/config.js');
var colors = require('colors');
var webdir = '/web';
var mobiledir = '/mobile';
var access_logfile = fs.createWriteStream('./access.log',{flags:'a'});

var https_server; 

// Virtual Hosts
/*
var site_vhosts=[],vhosts;
site_vhosts.push(express.vhost('qinyh.com',offical));
site_vhosts.push(express.vhost('www.qinyh.com',offical));
vhost=express.createServer.apply(this,site_vhosts);
https://gist.github.com/yssk22/676004
http://docs.mongodb.org/manual/use-cases/storing-comments/
http://docs.mongodb.org/manual/use-cases/inventory-management/
*/

// mongodb session
/*
var MongoStore = require('connect-mongo')(express);
var sessionStore = new MongoStore({url: config.sessionStore}, function() {
    	                  console.log('connect mongodb session success...');
})

// redis session
//host: config.redis.host, port: config.redis.port,
*/
var redisClient = require("redis").createClient(config.redis.port,config.redis.host)
redisClient.auth(config.redis.auth, function(result) {
	console.log("Redis authenticated.".green);  
});
redisClient.on("error", function (err) {  
     console.log("redis Error " + err.red);  
     return false;  
});    
redisClient.on('connect',function(err){
	console.log('redis connect success'.green);
});
var RedisStore  = require("connect-redis")(express);
var sessionStore = new RedisStore({  client:redisClient  });
exports.sessionStore= sessionStore;


//  allowed cross domain
var allowCrossDomain = function(req, res, next) {
  // Added other domains you want the server to give access to
  // WARNING - Be careful with what origins you give access to
  var allowedHost = [
    'http://localhost',
    'http://readyappspush.herokuapp.com/',
    'http://shielded-mesa-5845.herokuapp.com/'
  ];

  if(allowedHost.indexOf(req.headers.origin) !== -1) {
    //res.header('Access-Control-Allow-Max-Age', maxAge);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
  } else {
    res.send(404);
  }
};


/**********************************************
         express configuration
		 
		 replica
		 http://engineering.foursquare.com/2011/05/24/fun-with-mongodb-replica-sets/
		 http://blog.eventbrite.com/tech-corner-auto-recovery-with-mongodb-replica-sets-2/
		 http://docs.mongodb.org/manual/tutorial/reconfigure-replica-set-with-unavailable-members/
		 
		 
		 storm
		 https://github.com/helxsz/storm-starter
		 
		 amr
		 http://www.nt.ntnu.no/users/skoge/prost/proceedings/acc11/data/papers/0128.pdf
		 ¡«www.eit.uni-kl.de/koenig/gemeinsame_seiten/projects/ROSIG/PAC4PT_ROSIG_16012013.pdf
**********************************************/


  function traceCaller(n) {
    if( isNaN(n) || n<0) n=1;
    n+=1;
    var s = (new Error()).stack
      , a=s.indexOf('\n',5);
    while(n--) {
      a=s.indexOf('\n',a+1);
      if( a<0 ) { a=s.lastIndexOf('\n',s.length); break;}
    }
    b=s.indexOf('\n',a+1); if( b<0 ) b=s.length;
    a=Math.max(s.lastIndexOf(' ',b), s.lastIndexOf('/',b));
    b=s.lastIndexOf(':',b);
    s=s.substring(a+1,b);
    return s;
  }
  
  
if (process.env.NODE_ENV == 'production'){
   console.log('on production env', config.port);
}else if(process.env.NODE_ENV == 'development'){
   console.log('on development env');
}else {
   console.log('there is nothing about it'.yellow); //,   process.env.NODE_ENV,process.env
}

app.configure('development',function(){
	app.set('db-uri',config.mongodb_development);
    app.use(express.static(__dirname+'/static'));
    app.use(express.static(__dirname+'/weibo'));	
    app.use(express.static(__dirname+'/public'));
	
	app.use(webdir, 	express.static(__dirname+webdir));
	app.use(mobiledir,	express.static(__dirname+mobiledir));
	console.log('app on development 11111'.yellow,config.port);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	config.port = 80;
});

app.configure('production',function(){
	app.set('db-uri',config.mongodb_production);
	console.log('app on production'.yellow, config.port);
	app.use(express.errorHandler())
});

app.configure(function(){
	
    app.engine('.html', ejs.__express);
    app.set('view engine', 'html');
	app.set('views',__dirname+'/views');
	app.set('ejs',ejs);
	
    app.disable('x-powered-by');
	
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	
  // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
         return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    })); 	
	
	 // bodyParser should be above methodOverride
	app.use(express.bodyParser({uploadDir:__dirname+'/public/uploads',keepExtensions: true,limit: '50mb'}));
	app.use(express.methodOverride());
	//  // cookieParser should be above session
	app.use(express.cookieParser());
	 // express/mongo session storage  //  
    app.use(express.session({ 
					  cookie: { maxAge: 24 * 60 * 60 * 1000 }
    	              ,store: sessionStore
    	              ,secret: config.sessionSecret
					  ,key: 'express.sid'
					  ,clear_interval: 3600
    }));

	//app.use(express.logger({stream:access_logfile,format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms'}));
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {'timestamp':true});
    var logger_info_old = winston.info;
        winston.info = function(msg) {
        var fileAndLine = traceCaller(1);
        return logger_info_old.call(this, fileAndLine + ":" + msg);
    }	
	
	
    if (config.logRESTRequests) {
        app.use(function(req, res, next){
                winston.info(req.method + ' ' + req.url);
                next();
        });
    }
	
	
    //app.use(express.csrf()); 
	app.use(conditionalCSRF);
    app.use(function(req, res, next){
      res.locals.token = req.session._csrf;
	  res.locals.year = new Date().getFullYear();
      next();
    });
   
    app.use(passport.initialize());
    app.use(passport.session());	  
		
	// put at last	
	app.get('/version', function(req, res) {
        res.send('0.0.1');
    });	

	// error handling 
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler); 

    app.use(function (req,res, next) {
        var d = domain.create();
        d.on('error', function (err) {
          logger.error(err);
          res.statusCode = 500;
          res.json({sucess:false, messag: 'error in the server'});
          d.dispose();
        });
        d.add(req);
        d.add(res);
        d.run(next);
    });	
	
	/*
	app.use(function(req,res,next){
	    //console.log(req.ip,req.header('Referer'));	
	http://hublog.hubmed.org/archives/001927.html
       var City = geoip.City;
       var city = new City('public/GeoLiteCity.dat');
       // Synchronous method
       var city_obj = city.lookupSync('8.8.8.8');
       console.log(city_obj);
		   
	   next();
	});
	
    app.use (function (req, res, next) {
        var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
        if (schema === 'https') {
            next();
        } else {
           res.redirect('https://' + req.headers.host + req.url);
        }
    });	
    */
    //http://stackoverflow.com/questions/10697660/force-ssl-with-expressjs-3	
	app.use(function(req, res, next) {
       if(!req.secure) {
	      //console.log('not secure'.red,req.headers.host,req.get('Host'),req.url);
          //return res.redirect('https://' + req.get('Host') + req.url);
        }
		//console.log('secure '.green);
        next();
    });
	app.set('trust proxy', true);
	
	app.use(app.router);	
    app.use(function(req, res, next){
        res.status(404); 
        if(req.xhr){
            res.send({ error: 'Not found' });
            return;		
		}		
        if (req.accepts('html')) {
            res.render('error/404', { url: req.url });
            return;
        }
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }
    });	
});

function conditionalCSRF(req, res, next) {
/*https://github.com/balderdashy/sails/blob/master/lib/hooks/csrf/index.js */
  //compute needCSRF here as appropriate based on req.path or whatever
 var ua = req.header('user-agent');
 //console.log(ua);
 /*
 if(/mobile/i.test(ua)) {
     console.log('mobile.html'.green);
 } else {
     console.log('desktop.html'.green);
 }
  */   
  if (ua.indexOf("android") == -1) {
    //console.log('in csrf');
    express.csrf();
	next();
  } else {
    //console.log('no csrf');
    next();
  }
  
  //express.csrf();
  
}





/******************************************
           error handling   logging
*******************************************/



function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  winston.error(err.stack);
  if (req.xhr) {
    console.log('send error to the client in json'.red,err);
	/*
	if(err.name =='MongoError'){  // http://www.mongodb.org/about/contributors/error-codes/
	    switch(err.code){
		    case 11000:
			console.log('duplicate error  '.red,err.err);
			res.send(409, { detail: err.err, reason:"database key duplicate" });
		    break;
            case 11001:
			console.log('duplicate key on update '.red,err.err);
			res.send(409, { detail: err.err, reason:"duplicate key on update" });
		    break;
            case 12000:
			console.log('idxNo fails '.red,err.err);
			res.send(500, { detail: err.err, reason:"idxNo fails" });
		    break;
            case 13440:
			console.log('bad offset accessing a datafile'.red,err.err);
			res.send(500, { detail: err.err, reason:"bad offset accessing a datafile" });
		    break;			
			// other mongodb error 
		}	
	}else
	*/
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error/500', { error: err });
}

var startServer = function() {
    if (!module.parent) {
        if(app){
				winston.info("the port used ".yellow, config.port);
	        app.listen(config.port,'0.0.0.0',function(){
                winston.info('Express started on port'.yellow,config.port);				
	        });
	   

	  	/*
	        var out = app.listen(config.port, '0.0.0.0',function(){
	           console.log('Express started on port',config.port);	  
	        });
	  
	        process.nextTick(function () {
                if (out && out.address && out.address().port !== config.port) {
                    console.log("server listening on port: ".red + out.address().port);
                }
            });
        */
       }else{
            console.log("\r\ terminated ...\r\n".grey);
            process.exit();
        }
    }
}

var startSSLServer = function(){
	   var options = {
        key: fs.readFileSync('./conf/server.key').toString()
        ,cert: fs.readFileSync('./conf/server.crt').toString()
        ,requestCert: true
        ,rejectUnauthorized: false
		,passphrase: "1027"
      };
	   
      https_server = https.createServer(options,app).listen(443, '0.0.0.0', function(){
            console.log("Express server listening on port ".green + 433);
			var websocket = require('./routes/websocket_api');
			websocket.initWebsocket(https_server);
      });	  
}

var startSelfSSLServer = function() {
    var privateKey="";
    var certificate="";
    try {
        privateKey = fs.readFileSync('certs/server.key').toString();
        certificate = fs.readFileSync('certs/server.cert').toString();
    } catch ( e ) {
        console.log( "no certificate found. generating self signed cert.\n" );
    }
    
    if ( privateKey !== "" && certificate !== "" ) {
		loadServer();
		console.log('start SSL not private key and certificate '.red);
    }else {
        var spawn = require('child_process').spawn;
        
        var genSelfSignedCert = function() {
            var genkey = spawn( 'openssl', [
                'req', '-x509', '-nodes',
                '-days', '365',
                '-newkey', 'rsa:2048',
                '-keyout', 'certs/server.key',
                '-out', 'certs/server.cert',
                '-subj',
                '/C=' + config.country + '/ST=' + config.state + "/L=" + config.locale + "/CN=" + config.commonName + "/subjectAltName=" + config.subjectAltName
            ]);
            genkey.stdout.on('data', function(d) { util.print(d) } );
            genkey.stderr.on('data', function(d) { util.print(d) } );
            genkey.addListener( 'exit', function( code, signal ) {
                fs.chmodSync('certs/server.key', '600');
                loadServer();
            });
        };        
        var loadServer = function() {
		    console.log('load the server');
            privateKey = fs.readFileSync('certs/server.key').toString();
            certificate = fs.readFileSync('certs/server.cert').toString();
			https_server = https.createServer({ key: privateKey, cert: certificate,requestCert: true ,rejectUnauthorized: false },app).listen(443, function(){
                console.log("Express server listening on port " + 433);
            });
        };

        genSelfSignedCert();
    }
};

startServer();
//startSSLServer();
exports.https_server = https_server;

/******************************************************
            cluster2 
https://gist.github.com/dsibilly/2992412			
http://stackoverflow.com/questions/10663809/how-do-i-use-node-js-clusters-with-my-simple-express-app
http://stackoverflow.com/questions/7845478/node-js-express-cluster-and-high-cpu-usage
http://weblog.plexobject.com/?p=1697
*****************************************************
var Cluster = require('cluster2')
var c = new Cluster({
    port: 8080
	,cluster: false
	,timeout: 500

	,ecv: {
        path: '/ecv', // Send GET to this for a heartbeat
        control: true, // send POST to /ecv/disable to disable the heartbeat, and to /ecv/enable to enable again
        monitor: '/',
        validator: function() {
            return true;
        }
    }

});

c.on('died', function(pid) {
    console.log('Worker ' + pid + ' died');
});
c.on('forked', function(pid) {
    console.log('Worker ' + pid + ' forked');
});

c.listen(function(cb) {
	// You need to pass the app. monApp is optional. 
	// If monApp is not passed, cluster2 creates one for you.
	if(app)
    cb(app);
});


var cluster = require('cluster')

var numCPUs = require('os').cpus().length;
if(cluster.isMaster){
    for(var i=0;i<numCPUs;i++){
        cluster.fork();
    }
    cluster.on('death',function(worker){
            console.log('worker'+worker.id+' is death');
            cluster.fork();
    });
}else{
    app.listen(config.port,'0.0.0.0',function(){
	     console.log('Express started on port',config.port);	  
	});
}
*/
/******************************************
           terminate the server
*******************************************/
app.on('close', function () {
  console.log("Closed app".red);
  mongoose.connection.close();
});
//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',Date(Date.now()), sig);                 
      process.exit(1);
	  app.close();
   }
   console.log('%s: Node server stopped.'.red, Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});
var util = require("util");
// Don't crash on errors.
process.on("uncaughtException", function(error) {
  util.log("uncaught exception: ".red + error);
  util.log(error.stack);
  winston.error(error.stack.toString());
});

/*********************************************

        mongoose mongodb

**********************************************/

// mongodb mongoose
var mongoose = require('mongoose');
//mongoose.connect(config.mongodb.connectionString || 'mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.server +'/' + config.mongodb.database);
//mongoose.createConnection('localhost', 'database', port, opts);


var opts = { server: { auto_reconnect: false,poolSize: 10 }, user: '', pass: '',replset: { strategy: 'ping', rs_name: 'testSet' } }
var database_error = null;

mongoose.connect(config.mongodb_development,opts,function(err){
	if(err) { 
	    console.log('connect mongodb error'.red,err);
		database_error = err;
		if(err.name == 'MongoError' && err.code == 18 && err.errmsg == 'auth fails'){
		/*
	        mongoose.connection.db.authenticate(config.mongodb.user, config.mongodb.password, function(err) {
	            
	        } )
	     */   		   
		}else{
		    onConnectUnexpected(err);
		}	
	}
	else console.log('mongodb connect success');
});

mongoose.connection.on('open', function (err) {
      if (reconnTimer) { clearTimeout(reconnTimer); reconnTimer = null; }
      console.log('connection opening');
	  /*
	  if(!err){
	    //http://stackoverflow.com/questions/18688282/handling-timeouts-with-node-js-and-mongodb
         mongoose.connection.db.on('close', function() {
            if (this._callBackStore) {
                for(var key in this._callBackStore._notReplied) {
                    this._callHandler(key, null, 'Connection Closed!');
                }
            }
         });
      }
	  
	  mongoose.connection.db.admin().serverStatus(function(err, data) { 
	    if (err) {
	      if (err.name === "MongoError" && err.errmsg === 'need to login') {
	        console.log('Forcing MongoDB authentication');
	        mongoose.connection.db.authenticate(config.mongodb.user, config.mongodb.password, function(err) {
	          if (!err) return;
	          console.error(err);
	          process.exit(1);
	        });
	        return;
	      } else {
	        console.error(err);
	        process.exit(1);
	      }
	      
	      if (!semver.satisfies(data.version, '>=2.1.0')) {
	          console.error('Error: Uptime requires MongoDB v2.1 minimum. The current MongoDB server uses only '+ data.version);
	          process.exit(1);
	      };

	    }
	    else{
	    	console.log('mongod db open success',mongoose.connection.readyState);
	    }
	  });
	  */
});


/****************************
   mongoose retry
   https://gist.github.com/taf2/1058819
****************************/
var reconnTimer = null;
 /*  tryReconnect -> onConnectUnexpected  -> disconnected callback  */
function tryReconnect() {
    reconnTimer = null;
    console.log("try to connect: %d".grey, mongoose.connection.readyState);
    db = mongoose.connect(config.mongodb_development,function(err){
	    if(err) {
	        console.log('connect mongodb error'.red,err);
		    onConnectUnexpected(err);
	    }
	    else console.log('mongodb connect success'.green,mongoose.connection.readyState);
  });
}


function onConnectUnexpected(error){
		var reportAPI = require('./routes/report_api');
		reportAPI.reportToAdmin('cannot connect to mongodb '+error,function(err,data){
	           if(err) { console.log('can not send problem report mail ',err); }
	           else { console.log('send problem report mail successfully'.green); }		
		})
}

mongoose.connection.on('opening', function() {
  console.log("reconnecting... %d".red, mongoose.connection.readyState);
});

mongoose.connection.on('connecting', function (err) {

});

mongoose.connection.on('disconnecting', function (err) {
   console.log('mongodb disconnecting'.red,err);
});

mongoose.connection.on('disconnected', function (err) {
    console.log('mongodb disconnected'.red,err);
	if(err == null)  err = database_error;
    if(err){
        if(err.name == 'MongoError' && err.code == 18 && err.errmsg == 'auth fails'){
        
		}else{
		    reconnTimer = setTimeout(tryReconnect, 5000); 
		}
    }
});

mongoose.connection.on('close', function (err) {
  mongoose.connection.readyState = 0; // force...
  mongoose.connection.db.close(); // removeAllListeners("reconnect");
   
});

mongoose.connection.on('reconnected', function (err) {

});

mongoose.connection.on('error', function (err) {
    console.error(err);
});

/*******************************************
 mongodb close
********************************************/

function done (err) {
  if (err) console.error(err.stack);
  mongoose.connection.db.dropDatabase(function () {
    mongoose.connection.close();
  });
}

/// file grid
var GridStore = mongoose.mongo.GridStore;
var db = mongoose.connection.db;

///////////////////////////////////////////////////// 
exports.app = app;
exports.mongoose = mongoose;
exports.GridStore = GridStore;
// management modulers


bootControllers(app);

// Bootstrap controllers
function bootControllers(app) {
	fs.readdir(__dirname + '/routes', function(err, files){
		if (err) throw err;
		files.map(function (file) {
            return path.join(__dirname+'/routes', file);
        }).filter(function (file) {
            return fs.statSync(file).isFile();
        }).forEach(function (file) {         
			var i = file.lastIndexOf('.');
            var ext= (i < 0) ? '' : file.substr(i);
			if(ext==".js")
			bootController(app, file);	
        });
	});
}

function bootController(app, file) {
	var name = file.replace('.js', '');
	//console.log( name);
	require( name);				
}


//var pluginHelper = require('./pluginHelper');
//pluginHelper.getPluginList(__dirname +'/plugins');

