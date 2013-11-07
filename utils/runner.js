var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
	cluster = require('cluster'),
	color = require('colors');;

process.on('message', function( code ) {
	//console.log('running the code',code, code.path);
	// type:0 == start server error , type: 1 == start server ok  , type: 2 == end server ok, type: 3 == normal server msg
	if(code.type == 0){         // end the server
	    process.send( {'type':2,'data':null }); 
	}else if(code.type == 1){   // start the server
	    if(code.path !=null){
	        runServerFromPath2(code.path,function(err,data){
                if(err) process.send({'type':0,'err':err});		
	            else process.send( {'type':1,'data':null }); 
	        });
	    }else if(code.code !=null){
            runServerCode(code.src,function(err,data){
	            if(err) process.send({'type':0,'err':err});	
		        else process.send( {'type':1,'data':null });
	        })		
	    }else{	
	        console.log('can not execute the code, since the path or src of code is invalid'.red);
	    }	
	}

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
	//console.log('finish executing the code'.green);
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
		//console.log('finish executing the code'.green);
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
		//console.log('finish executing the code'.green);
		return callback(null,'success');
    })
}

exports.runServerCode = runServerCode;
exports.runServerFromPath2 = runServerFromPath2;
exports.runServerFromPath = runServerFromPath;