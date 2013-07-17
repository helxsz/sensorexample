/*
 
Dear Twitter, 
 
According to your docs (https://dev.twitter.com/docs/rate-limiting) users authenticated with oAuth should see a rate limit of 350 requests per hours against the REST API.
 
Unfortunately despite trying numerous libraries (as suggested in your docs) I have been unable to acieheve this limit. 
 
I only ever see 150. I have read many of the discussions on the forum which suggest that my oAuth authorisation has not been sucessful. I can however see that the rate limit is not shared accross other users on my IP, each user that logs in gets 150 request per hour. The x-warning field is also never present in the returned data. This suggests to me that my users have sucessfully logged in. 
 
For example, requesting: 
 
https://api.twitter.com/1/users/show.json
 
Return: 
 
"limit remaining: ": "98",
"x-ratelimit-limit": "150",
"x-ratelimit-reset": "1342455524",
"x-ratelimit-class": "api"
 
In order to confirm it was not the libraries causing the issue I have written a small app which does not use any oAuth library and just follows the steps detailed here: 
 
https://dev.twitter.com/docs/auth/implementing-sign-twitter
 
It uses Node.js; you can run with: 
 
node app.js
 
You can then view the app by going to: http://127.0.0.1:8081. You will note that even after authentication the rate limit never exceeds 150.
 
Any help much apprieciated. 
 
Thanks
 
Simon
 https://dev.twitter.com/discussions/9321
 https://gist.github.com/simonmcmanus/3123561
 http://stackoverflow.com/questions/11821958/nodejs-any-module-to-limit-express-request-rate
 https://github.com/einaros/ratelimit
 
*/
 
 
var express = require('express');
var app = express.createServer();
var request = require('request');
var qs = require('querystring');
 
var CONSUMER_KEY = "SECRET";
var CONSUMER_SECRET = "TOKEN";
 
// Twitter OAuth
var qs = require('querystring');
var oauth = {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    callback: 'http://127.0.0.1:8081/cb'
};
 
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.cookieParser());
    app.use(express.session({ secret: "very secret" }));
});
 
app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});
 
app.get('/', function(req, res) {
  request.post({url: 'https://twitter.com/oauth/request_token', oauth: oauth}, function(error, data) {
    data = qs.parse(data.body);
    if(data.oauth_callback_confirmed === 'true') {
      if(!req.session) {
        req.session = {};
      }
      req.session.oauth_token = data.oauth_token;
      req.session.oauth_token_secret = data.oauth_token_secret;
      res.redirect("https://twitter.com/oauth/authenticate?oauth_token="+data.oauth_token);
    }
  });
});
 
app.get('/cb', function(req, res) {
 
  if(req.query['oauth_token'] != req.session.oauth_token) {
    console.log('TOKEN DID NOT MATCH');
    return 'Tokens do not match.';
  }
 
  oauth.token = req.query['oauth_token'],
  oauth.oauth_verifier = req.query['oauth_verifier'];
  oauth.token_secret = req.session.oauth_token_secret;
  
  request.post({url:'https://api.twitter.com/oauth/access_token', oauth:oauth}, function (e, r1, body) {
    var perm_token = qs.parse(body);
    var params = {
      screen_name: perm_token.screen_name,
      user_id: perm_token.user_id
    };
    request.get({url:'https://api.twitter.com/1/users/show.json?'+qs.stringify(params)+'', oauth:oauth, json:true}, function (e, r, user) {
      res.json({
        'limit remaining: ' : r.headers['x-ratelimit-remaining'],
        'x-ratelimit-limit' : r.headers['x-ratelimit-limit'],
        'x-ratelimit-reset' : r.headers['x-ratelimit-reset'],
        'x-ratelimit-class' : r.headers['x-ratelimit-class'],
        'x-warning'         : r.headers['x-warning']
      });
    });
  });
});
 
app.listen('8081');