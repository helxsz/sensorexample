// http://the-taylors.org/blog/2012/10/07/using-oauth-to-connect-with-github-using-nodejs/
// http://masashi-k.blogspot.co.uk/2012/09/everyauthtwitter-express3-swig.html
// https://github.com/bnoguchi/everyauth
/**/
var app,  everyauth, exp;
var express = require("express");
var app = express();
var colors = require('colors');

  app.configure(function() {
    app.set('view engine', 'jade');
    //app.set('view', __dirname + '/views');
    //app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'hello'
    }));
    app.use(app.router);
  });

  app.get('/', function(req, res) {
    var user;
    res.send(200,"abc");
  });  
   
app.listen(3000);

console.log("expressress server listening on port %d", 3000);
