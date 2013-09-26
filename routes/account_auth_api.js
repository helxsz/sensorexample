//http://cnodejs.org/topic/516774906d38277306ff5647
//https://github.com/ammmir/node-oauth2-provider  https://github.com/jaredhanson/oauth2orize

// https://github.com/xiaojue/tuer.me/blob/master/api.js#L75  https://github.com/xiaojue/tuer.me/blob/master/routes/apis/feed.js

// http://danielstudds.com/setting-up-passport-js-secure-spa-part-1/  http://danielstudds.com/adding-verify-urls-to-an-express-js-app-to-confirm-user-emails-secure-spa-part-6/
// https://github.com/madhums/node-express-mongoose-demo
// http://elegantcode.com/2012/05/15/taking-toddler-steps-with-node-js-passport/
var mongoose = require("mongoose")
    , GridStore = mongoose.mongo.GridStore
    , ObjectID = mongoose.mongo.BSONPure.ObjectID;
var crypto = require('crypto');	
var _=require('underscore');

var config = require('../conf/config.js');
var app = require('../app.js').app;

var moment = require('moment');	
var redis = require('redis'),
    fs = require('fs'),
	io = require('socket.io');
	
var permissionAPI = require('./permission_api');

var userModel = require('../model/user_model');

var passport = require('passport') , 
    LocalStrategy = require('passport-local').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	GithubStrategy = require('passport-github').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
	
// serialize sessions
 passport.serializeUser(function(user, done) {
    done(null, user);
 })

passport.deserializeUser(function(id, done) {
    done(null,id);
	/*
    userModel.findUserByQuery({ _id: id }, function (err, user) {
      done(err, user)
    })
	*/
})

/*
	social:{
		facebook:{ id:String,avatar:String,name:String,token:String},
		twitter:{id:String,avatar:String,name:String,token:String},
		github:{id:String,avatar:String,name:String,token:String},
		google:{id:String,avatar:String,name:String,token:String}
	}
*/

console.log(config.github.clientID,config.github.clientSecret,config.github.callbackURL);

// use github strategy
passport.use(new GithubStrategy({
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
	 /*
      userModel.findUserByQuery({ 'social.github.id': profile.id }, function (err, user) {
        if (!user) {
		   console.log('github user not found'.red);
		  
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'github',
            github: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err)
            return done(err, user)
          })
		 
        } else {
		  console.log('github user  found'.green);
          return done(err, user)
        }
      })
	  */
	    console.log('GithubStrategy   /auth/github.............',profile.id, profile.displayName, profile.username, profile.emails[0], profile._json.avatar_url);	  
        process.nextTick(function () {
         return done(null, profile);
       });	  	  
    }
))

  // use facebook strategy    https://developers.facebook.com/apps/663584603654022/summary?save=1
passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
	 /*
      User.findOne({ 'facebook.id': profile.id }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err)
            return done(err, user)
          })
        }
        else {
          return done(err, user)
        }
      })
	 */
	    console.log('FacebookStrategy   /auth/github.............',profile.id, profile.displayName, profile.username, profile.emails[0].value, profile._json.avatar_url);	  
        process.nextTick(function () {
         return done(null, profile);
       });	 
    }
  ))
  


  // use twitter strategy  
passport.use(new TwitterStrategy({
      consumerKey: config.twitter.clientID,
      consumerSecret: config.twitter.clientSecret,
      callbackURL: config.twitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
	/*
      User.findOne({ 'twitter.id': profile.id }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'twitter',
            twitter: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err)
            return done(err, user)
          })
        }
        else {
          return done(err, user)
        }
      })
	*/
	    console.log('TwitterStrategy   /auth/github.............',profile.id, profile.displayName, profile.username, profile.emails[0], profile._json.avatar_url);	  
        process.nextTick(function () {
         return done(null, profile);
       });	
	
    }
))


//  github   function will not be called.
app.get('/auth/github',passport.authenticate('github') , function(req, res){    
	console.log('github not called '.red);
});

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login',successRedirect: '/' }), function(req, res) {
    res.redirect('/');	
});

//  facebook
app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
});

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login',successRedirect: '/' }), function(req, res) {
    res.redirect('/');
});

// function will not be called.  twitter
app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res){
});

app.get('/auth/twitter/callback',    passport.authenticate('twitter', { failureRedirect: '/login',successRedirect: '/' }), function(req, res) {
    res.redirect('/');
});

// https://github.com/jaredhanson/passport-facebook/blob/master/examples/login/app.js   https://github.com/jaredhanson/passport-twitter/blob/master/examples/signin/app.js

/*  
// use local strategy
passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
))  
  
  






  // use google strategy
passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ 'google.id': profile.id }, function (err, user) {
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            google: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err)
            return done(err, user)
          })
        } else {
          return done(err, user)
        }
      })
    }
));
 */