// http://www.davidmclifton.com/2011/08/18/node-js-virtual-machine-vm-usage/
// http://www.joezimjs.com/javascript/dependency-injection-with-node-js/
// http://stackoverflow.com/questions/11652530/node-js-vm-how-to-cancel-script-runinnewcontext
var util = require('util'),
    vm = require('vm'),
	 async = require('async'),
	path = require('path'),
    fs = require('fs'),
	cluster = require('cluster'),
	color = require('colors');
	
var runner = require('./runner');
    

var coding_repository  = path.join(path.dirname(fs.realpathSync(__filename)), '../coding-repository');
//console.log(coding_repository,"      ",path.dirname(fs.realpathSync(__filename)));	

/*
client runs a virual machine, on the server side, we need to assign him a 
1. repository to store the server and client files 
2. a seperate process to run the server code
3. a seperate port to run the server 
4. if client is registered user, zip the code and store in grids, when needed loaded the code from grids 
5. configration - code executing time, users limits in creating the server code
*/
/*
createAThread("runner.js",5000);
runner.	runServerFromPath2('auth2.js',function(err,data){		            
});
*/
initVirtualEnv();
function initVirtualEnv(){
    cluster.setupMaster({
        exec : "utils/runner.js",
        args : process.argv.slice(2),
        silent : false
    });
    cluster.on('disconnect', function(worker) {
	    
        console.log('The worker #'.green + worker.id + ' has disconnected');
    });
	
	cluster.on('exit', function(worker, code, signal) {
	    if (worker.suicide === true) {  //kill disconnect
             console.log('Oh, it was just suicide\' ¨C no need to worry');
        }	
        console.log('worker %d died (%s).'.green,worker.process.pid, signal || code);        
    });
	//This will be fired when the forked process becomes online
    cluster.on( "online", function(worker) {
        console.log('worker %d started (%s).',worker.process.pid);
		// send command: 1, start server, command :2, refresh server, 0: refresh server.
        worker.on( "message", function(msg) {
			if(msg.type == 0){    
			    console.log('worker start server error'.red, msg.err); 
				worker.destroy();
				// give the error to the user
				
			}else if(msg.type == 1){  
			    console.log('worker start server ok'.green, msg.data);
                // feedback the server data back to user				
			}else if(msg.type == 2){  
			    console.log('worker end server ok'.green, msg.data); 
				worker.destroy();
				worker.kill();
				//worker.disconnect();
				// feedback the server status back to user
			}else if(msg.type == 3){  			    
				console.log('worker normal message'.green, msg.data);
                // server message 				
			}           
        });
    });	
}

			
function createVirtualServer(filepath, time_limit,callback){		
    var worker = cluster.fork();
	worker.send( {'type':1,'path':filepath} );
	callback(null,{'pid':worker.process.pid});
	/**/
	var timer = 0;
    timer = setTimeout( function() {
		clearTimeout(timer); //The worker responded in under 5 seconds, clear the timeout
        //console.log("worker timed out, should end server");
		//worker.send( {'type':0} );//startServer(worker);
		
		getVirtualServers(function(err,data){   
		    console.log("getVirtualServers".green , data  );		
		});		
    }, time_limit);   	
}

function endVirtualServer(server_id, callback){
    var found = false;
    for (var id in cluster.workers) {
	    var worker = cluster.workers[id];
        if( server_id == worker.process.pid){
		    found = true;			
			worker.kill();
			return callback(null,{'end':'success','pid':server_id});
		}
    } 
	if(found == true){
	    callback(null,{'end':'success','pid':server_id});
	}else{
	    callback(null,{'end':'fail'});
	}
}

function getVirtualServers(callback){
    var servers = [];
    for (var id in cluster.workers) {
	    var worker = cluster.workers[id];
        servers.push({'pid':worker.process.pid});
    } 
	callback(null,servers);
}

function stopAllVirtualServers(callback){
	console.log('stopAllVirtualServers');
	var stopWorkerServer = function(id,callback2){
	    
        var worker = cluster.workers[id];
		console.log('kill process  ',worker.process.pid);
		worker.kill();
		callback2();
	}
	
	async.each(cluster.workers, stopWorkerServer, function(err){
		if(err)
		callback(err,null);
		else
		callback(null,null);
    });
	
}

exports.createVirtualServer = createVirtualServer;
exports.endVirtualServer = endVirtualServer;
exports.getVirtualServers = getVirtualServers;
exports.stopAllVirtualServers = stopAllVirtualServers;

// how to kill the cluster / work / 
// how to make the server work
// allow the worker to run in limited time
// tie the process, server to the  user and folder which has the server code
