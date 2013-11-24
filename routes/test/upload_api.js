var mongoose = require("mongoose")
    , GridStore = mongoose.mongo.GridStore
    , ObjectID = mongoose.mongo.BSONPure.ObjectID;
var crypto = require('crypto');	

var app = require('../app').app;
var sessionStore =  require('../app').sessionStore;
var config = require('../conf/config.js');

var im = require('imagemagick'),fs = require('fs');	
var moment = require('moment');	
var	gridfs = require("./gridfs");
var	shortener = require("../model/shortener");
	
app.get('/fileupload', fileUpload);
app.post('/file/upload', fileUploadPost);
app.get('/d/:id', shortDownload);	


var connect = require('express/node_modules/connect')
, parseSignedCookie = connect.utils.parseSignedCookie
, cookie = require('express/node_modules/cookie');

function fileUpload(req, res) {
    //https://gist.github.com/founddrama/2182389
	// http://momentjs.com/docs/
    console.log(  moment().add('days', 2).fromNow() );
    console.log(   moment().subtract('days', 2).fromNow()  );	
	console.log(moment(new Date()).format('YYYY-MM-DD h:mm a'));
	
	res.render('upload/fileUpload.html', {title:"Testing",res:res,csrf_token: req.session._csrf });
};

function fileUploadPost(req, res) {
    console.log(req.files.image.path,req.files.image.type);
	
	var file = req.files.image;
	var filename = req.files.image.name;
	var thumbnail = {
        path: "/uploads/thumbnail_" + filename,
        filename: "thumbnail_" + filename,
    };
	
	var finish = 0, waitForAsync = 2;	
	var done = function () {
        if (++finish === waitForAsync) {

        }
    };
	
	im.resize({
        srcPath: file.path,
        dstPath: 'lala.jpg',
        width: 150,
        height: 150,
        quality: 1
    }, function(err, stdout, stderr) {
         console.log('stdout'.green,stdout);
         console.log('stderr'.green,stderr);
         console.log('error'.red,err);
		 
		fs.unlink(file.path,function (err) {
            if (err) throw err;
            console.log('successfully deleted /tmp/hello');
        });
		 /*
    gridfs.putFile(filename, file.path, options, function(err, result) {
      media.src = result._id;
      done();
    });

    gridfs.putFile(thumbnail.filename, thumbnail.path, options, function(err, result) {
      media.thumbnail = result._id;
      done();
    });
	*/
    });


	
	return gridfs.putFile(req.files.image.path, req.files.image.name, 
	                     {'content_type':file.type,'chunk_size':file.size,metadata: { "info": req.files.image.name}}, function(err, result) {
	    console.log(req.files.image.path,req.files.image.name,result._id);
		shortener.generate(result._id, function(shortId) {
			ret = {};
	      ret.name = result.metadata.filename;
	      ret.size = result.length;
		  ret.type = result.contentType;
	      ret.url = "http://localhost:8080/d/"+shortId;
			console.log('Returning:',shortId);
			console.log([ret]);
			res.json([ret]);
		});
	});
};

function shortDownload(req, res) {
	return shortener.getId(req.params.id, function(fullId) {
		if(fullId == null) return res.render('fileNotFound');
		else
			return gridfs.get(fullId, function(err, file) {
				res.header("Content-Type",  file.contentType);  //'application/octet-stream'
				res.header("Content-Disposition", "attachment; filename=" + file.filename);
				res.header('Content-Length', file.length);
				return file.stream(true).pipe(res);
			});
	});
};

function download(req, res) {

	return gridfs.get(req.params.id, function(err, file) {
		res.header("Content-Type", file.contentType);
		res.header("Content-Disposition", "attachment; filename=" + file.filename);
		res.header('Content-Length', file.length);
		console.log(file.length);
		return file.stream(true).pipe(res);
	});	
};

module.exports = {
    fileUploadPost : fileUploadPost,
    shortDownload : shortDownload,
    download : download
};

