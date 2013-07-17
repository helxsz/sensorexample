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
      userModel.findOne({'social.github.id' : id}, function(err, user) {
      if(err) throw err;
      if(callback) 
        callback(user);
      else
        return user;
      });
  }else if(req.url='/auth/facebook'){
      userModel.findOne({'social.fb.id' : id}, function(err, user) {
      if(err) throw err;
      if(callback) 
        callback(user);
      else
        return user;
      });  
  }else if(req.url='/auth/google'){
  
  }else if(req.url='/auth/twitter'){
  
  }
});

everyauth.everymodule.handleLogout( function (req, res) {
  // Put you extra logic here
  console.log('log out');
  req.logout(); // The logout method is added for you by everyauth, too

  // And/or put your extra logic here

  this.redirect(res, this.logoutRedirectPath());
});

  everyauth.github.appId(conf.github.appId).appSecret(conf.github.appSecret).findOrCreateUser(function(session, token, secret, gituser) {
    var promise = this.Promise();
    userModel.find({'social.github.id' : gituser.id}, function(err, users) {
     if(err) throw err;
     if(users.length > 0) {
	   console.log('find the user'.green,users.length);
       promise.fulfill(users[0]);
     } else {
       var user = new userModel();
       user.social.github.id = gituser.id;
       user.social.github.avatar_url = gituser.avatar_url;
       user.social.github.name = gituser.name;
       user.social.github.accessToken = gituser.accessToken;
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
    return res.render('index', {title: user, usr: user,layout: false  });  
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
      id   : ObjectId,
      social:{
	   github:{ 
	     id: Number
         , avatar_url: String
         , name: String
         , dateCreated: Date
         , accessToken : String
	   },
	   google:{
	     email: String
         , accessToken: String
         , expires: Date
         , refreshToken: String 
       },
	   twitter:{
	      id: String
	     , accessToken: String
         , accessTokenSecret: String
         , name: String
         , screenName: String
         , location: String
         , description: String
         , profileImageUrl: String
         , url: String 	   
	   },
	   fb: {
           id: String
           , accessToken: String
           , expires: Date
           , name: {
               full: String
               , first: String
               , last: String
           }
          , fbAlias: String
          , gender: String
          , email: String
		}
	  }
});

var conn = mongoose.createConnection('mongodb://localhost/authtest');
var userModel = conn.model('User', userSchema);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////


everyauth.facebook.appId(conf.facebook.appId).appSecret(conf.facebook.appSecret).findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUser) {
    var promise = this.Promise();
    userModel.find({'social.facebook.userid' : gituser.id}, function(err, users) {
     if(err) throw err;
     if(users.length > 0) {
	   console.log('find the user'.green,users.length);
       promise.fulfill(users[0]);
     } else {
       var user = new userModel();
       user.social.fb.id = fbUser.id;
       user.social.fb.name = fbUser.name;
       user.social.fb.accessToken = fbUser.accessToken;
	   user.social.fb.email = fbUser.email;
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


	
	
app.get('/auth/facebook', function(req, res) {
    //var fullURL = req.protocol + "://" + req.get('host') + req.url;
    var user;
	console.log('1111111111111111  facebook'.green);
	console.log('.............................'.green,req.url);
    if (req.session.auth) {
      //console.log('session'.green,req.session.auth.github);
      user = req.session.auth.facebook.user.name;
      //console.log("user:" + user);
    }else{
	  console.log('abcc facebook');
	}
    return res.render('index', {
      title: user,
      usr: user,
      layout: false
    });
});




app.get('/a',function(res,req){

   res.send('aaaaaaaaaaaaa');

})

app.get('/b',function(res,req){

   res.send('bbbbbbbbbbbbb');

})
/**/


var https = require('https');
app.get('/board',function(req,res) {
    if (!req.session.auth) {
        return res.redirect('/');
    }
	
	console.log(req.session);
    var repos,
        opts = {
			host: "api.github.com",
			path: '/user/repos?access_token=' + req.session.auth.github.accessToken,
			method: "GET"
		},
    	 request = https.request(opts, function(resp) {
    		var data = "";
    		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			data += chunk;
		});
		resp.on('end', function () {
			repos = JSON.parse(data); 
			console.log('repos',repos);
			//res.render('board',{ repos: repos});
		    res.send(repos);
		});
    	});
    request.end();
});
  
 /* 
 
 everyauth.twitter.consumerKey(conf.twitter.consumerKey).consumerSecret(conf.twitter.consumerSecret).findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');
 
  app.get('/auth/twitter', function(req, res) {
    //var fullURL = req.protocol + "://" + req.get('host') + req.url;
    var user;
	console.log('1111111111111111 twitter'.green);
	console.log('.............................'.green,req.url);
    if (req.session.auth) {
      //console.log('session'.green,req.session.auth.github);
      user = req.session.auth.twitter.screen_name
      //console.log("user:" + user);
    }
    return res.render('index', {
      title: user,
      usr: user,
      layout: false
    });
  });  
  
 */
 
/*
everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
//    .loginLocals({
//      title: 'Login'
//    })
//    .loginLocals(function (req, res) {
//      return {
//        title: 'Login'
//      }
//    })
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];
      return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
//    .registerLocals({
//      title: 'Register'
//    })
//    .registerLocals(function (req, res) {
//      return {
//        title: 'Sync Register'
//      }
//    })
    .registerLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async Register'
        });
      }, 200);
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      if (usersByLogin[login]) errors.push('Login already taken');
      return errors;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      return usersByLogin[login] = addUser(newUserAttrs);
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');
*/	

var request = require('request');

app.get('/pro/:name',function(req,res){

	console.log(req.session);
	/*
    var repos,
        opts = {
			host: "api.github.com",
			path: '/users/'+req.params.name+'/repos',
			method: "GET"
		},
    	 request = https.request(opts, function(resp) {
    		var data = "";
    		resp.setEncoding('utf8');
		resp.on('data', function (chunk) {
			data += chunk;
		});
		resp.on('end', function () {
			repos = JSON.parse(data); 
			console.log('repos',repos);
			//res.render('board',{ repos: repos});
		    res.send(repos);
		});
    	});
    request.end();
  // https://api.github.com/users/username/repos
    */
  request('https://api.github.com/users/'+req.params.name+'/repos', function (error, response, body) {
      if (!error && response.statusCode == 200) {
          //console.log(body) // Print the google web page.
		  
		  var json = JSON.parse(body);
          json.forEach(function(repo){
               console.log(repo.name,repo.description) ;
          });		  
		  res.send(body);
      }  
  })
})