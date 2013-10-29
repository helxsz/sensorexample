var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
	cluster = require('cluster'),
	color = require('colors');;

process.on('message', function( UNKNOWN_CODE ) {
    //run the code directly
	/*
    runServerCode(UNKNOWN_CODE,function(err,data){
	    if(err) console.log(err);
		else console.log(data);
	})
	*/
	// run the code in path indirectly
	runServerFromPath2('auth2.js',function(err,data){	
	    process.send( "finished  bla bla" ); //Send the finished message to the parent process
	});
});

function runServerCode(code,callback){
	try {
		    var obj = {require: require, console: console};
		    var ctx = vm.createContext(obj);
			var script = vm.createScript(code);
			script.runInNewContext(ctx,1000);
		}catch( e ){
		    console.log(e);
			return callback(e,null);
		}
	console.log('finish executing the code'.green);
}

function runServerFromPath(filepath,callback){	
    fs.readFile(filepath, 'utf8', function (err,code) {
        if (err) {
          console.log(err);
		  return callback(err,null);
        }
		try {
		    var obj = {require: require, console: console};
		    var ctx = vm.createContext(obj);
			var script = vm.createScript(code);
			script.runInNewContext(ctx,1000);
		}catch( e ){
		    console.log(e);
			return callback(e,null);
		}
		console.log('finish executing the code'.green);
		return callback(null,'success');
    })
}

function runServerFromPath2(filepath,callback){
    fs.readFile(filepath, 'utf8', function (err,code) {
        if (err) {
          console.log(err);
		  return callback(err,null);
        }
		try {
		    vm.runInNewContext(code, { require: require, console: console}, 1000);
		}catch( e ){
		    console.log(e);
			return callback(e,null);
		}
		console.log('finish executing the code'.green);
		return callback(null,'success');
    })
}

exports.runServerCode = runServerCode;
exports.runServerFromPath2 = runServerFromPath2;
exports.runServerFromPath = runServerFromPath;