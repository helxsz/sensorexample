var ffmpeg = require('fluent-ffmpeg');
var app = require('../app.js').app;
var fs = require("fs"); 
//https://github.com/nmrugg/Gallery.js
//https://github.com/nagendra27/Video-Spike
//https://github.com/joshmcarthur/electric-avenue
//https://github.com/ufik/androidRobotServerClient/blob/master/scripts/server.js
app.get('/video1/:abc', function(req, res) {

  console.log('/video/:filename');
  res.contentType('mp4');
  var pathToMovie = 'public/flowplayer/470x250.mp4' ;//+ req.params.filename; 
  var proc = new ffmpeg({ source: pathToMovie, nolog: true })
    // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
    // save to stream
	.usingPreset('flashvideo')
    .writeToStream(res, function(retcode, error){
	  //if(error) console.error('error',error); 
      //else console.log('file has been converted succesfully');
    });
});

app.get('/video2/:abc', function(req, res) {

  console.log('/video/:filename');
  res.contentType('mp4');
  var pathToMovie = 'public/flowplayer/470x250.mp4' ;//+ req.params.filename; 
  var proc = new ffmpeg({ source: pathToMovie, nolog: true })
    .writeToStream(res, function(retcode, error){
	  if(error) console.error('error',error); 
      else console.log('file has been converted succesfully');
    });
});

app.get('/vv1', function(req, res) {

    res.sendfile('public/flowplayer/index.html');  
});

app.get('/vv2', function(req, res) {

    res.sendfile('public/flowplayer/index2.html');  
});





