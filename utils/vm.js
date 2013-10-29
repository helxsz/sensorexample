// http://www.davidmclifton.com/2011/08/18/node-js-virtual-machine-vm-usage/
// http://www.joezimjs.com/javascript/dependency-injection-with-node-js/
// http://stackoverflow.com/questions/11652530/node-js-vm-how-to-cancel-script-runinnewcontext
var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
	cluster = require('cluster'),
	color = require('colors');
	
var runner = require('./runner');
    

console.log(__filename);
var coding_repository  = path.join(path.dirname(fs.realpathSync(__filename)), '../coding-repository');
console.log(coding_repository,"      ",path.dirname(fs.realpathSync(__filename)));	

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
			
function createAThread(filepath, time_limit){
    cluster.setupMaster({
        exec : filepath,
        args : process.argv.slice(2),
        silent : false
    });
	//This will be fired when the forked process becomes online
    cluster.on( "online", function(worker) {
        console.log('worker on line');
        var timer = 0;
        worker.on( "message", function(msg) {
            clearTimeout(timer); //The worker responded in under 5 seconds, clear the timeout
            console.log(msg);
            worker.destroy(); //Don't leave him hanging 

        });
        timer = setTimeout( function() {
            worker.destroy(); //Give it 5 seconds to run, then abort it
            console.log("worker timed out");
        }, 5000);
        worker.send( 'while(true){}' ); //Send the code to run for the worker
    });
    cluster.fork();
}

exports.createAThread = createAThread;

// how to kill the cluster / work / 
// how to make the server work
// allow the worker to run in limited time
