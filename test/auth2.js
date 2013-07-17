// http://the-taylors.org/blog/2012/10/07/using-oauth-to-connect-with-github-using-nodejs/
// http://masashi-k.blogspot.co.uk/2012/09/everyauthtwitter-express3-swig.html
// https://github.com/bnoguchi/everyauth

  var app, conf, everyauth, exp;

  var express = require("express");
  var app = express();

  everyauth = require('everyauth');

  conf = require('./conf');


var colors = require('colors');

// http://stackoverflow.com/questions/10388098/configuring-findbyuserid-for-everyauth-node-express-mongoose-everyauth?rq=1
// http://stackoverflow.com/questions/8337848/how-can-i-deny-a-user-from-logging-in-with-mongoose-auth-everyauth?rq=1
everyauth.everymodule.findUserById( function (req,id, callback) {
/**/
  var fullURL = req.protocol + "://" + req.get('host') + req.url;
  console.log('url'.green,req.url);

  if(req.url == '/auth/github'){
      userModel.findOne({'userid' : id}, function(err, user) {
      if(err) throw err;
      if(callback) 
        callback(user);
      else
        return user;
     });
  }else if(req.url='/auth/facebook'){
  
  }else if(req.url='/auth/google'){
  
  }else if(req.url='/auth/twitter'){
  
  }
});

  everyauth.github.appId(conf.github.appId).appSecret(conf.github.appSecret).findOrCreateUser(function(session, token, secret, gituser) {
    var promise = this.Promise();
    userModel.find({'userid' : gituser.id}, function(err, users) {
     if(err) throw err;
     if(users.length > 0) {
	   console.log('find the user'.green,users.length);
       promise.fulfill(users[0]);
     } else {
       var user = new userModel();
       user.userid = gituser.id
       user.avatar_url = gituser.avatar_url
       user.name = gituser.name
       user.accessToken = gituser.accessToken
       user.save(function(err) {
         if (err) {
		         promise.fail('Denied');//throw err;
		  }
		 console.log('save the user'.green);
          promise.fulfill(user);
       });
     }
    });
	return promise;
  })
  .redirectPath('/');


  app.configure(function() {
    app.set('view engine', 'jade');
    app.set('view', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'hello'
    }));
    app.use(everyauth.middleware());
    app.use(app.router);
    app.use(express.logger());
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.get('/', function(req, res) {
    var user;
    if (req.session.auth) {
      //console.log('session'.green,req.session.auth.github);
      user = req.session.auth.github.user.name;
      //console.log("user:" + user);
    }
    return res.render('index', {
      title: user,
      usr: user,
      layout: false
    });  
     //res.redirect('/auth/github');
  });  
  
  app.get('/auth/github', function(req, res) {
    //var fullURL = req.protocol + "://" + req.get('host') + req.url;
    var user;
	console.log('111111111111111111111111111111111111111'.green);
	console.log('.............................'.green,req.url);
    if (req.session.auth) {
      //console.log('session'.green,req.session.auth.github);
      user = req.session.auth.github.user.name;
      //console.log("user:" + user);
    }
    return res.render('index', {
      title: user,
      usr: user,
      layout: false
    });
  });

 
  app.listen(3000);

  console.log("expressress server listening on port %d", 80);
////////////////////////////////////////////////////////////////////////////////

var mongoose = require('mongoose');
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var userSchema = new Schema({
      id                : ObjectId
    , userid                  : Number
    , avatar_url     : String
    , name                : String
    , dateCreated         : Date
    , accessToken         : String
});

var conn = mongoose.createConnection('mongodb://localhost/authtest');
var userModel = conn.model('User', userSchema);


