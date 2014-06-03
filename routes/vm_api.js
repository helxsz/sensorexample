var util = require('util'),
    vm = require('vm'),
	path = require('path'),
    fs = require('fs'),
    async = require('async'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto');

var app = require('../app').app,
    gridfs = require("./gridfs"),
	vm = require("../utils/vm");	
    runner = require("../utils/runner");


app.get('/lab/multi',function(req,res,next){
	/*
    var root = path.join("lib","abc")+"/";
	console.log('root   ',root);	
    fs.readdir('../fablab/public/coding/',function(err,fns) {
        var dirs = [];
        var files = [];                                        
        fns.sort().filter(function(fn) {
            var fullPath = fspath.join(path,fn);
            var absoluteFullPath = fspath.join(root,fullPath);
            if (fn[0] != ".") {
                var stats = fs.lstatSync(absoluteFullPath);
                if (stats.isDirectory()) {
                     dirs.push(fn);
                } else {
                    var meta = getFileMeta(root,fullPath);
                    meta.fn = fn;
                    files.push(meta);
                }
            }
                                                
        });
    });	
		
	
	vm.createVirtualServer("utils/server_test.js",5000,function(err,data){   
		     
	});	*/
    
    res.render('lab/multi/app');    
})	

/*
	redisClient.multi()
	.hmset("train_id:"+train_id,"uid",train_uid,function(){})
	.expire("train_id:"+train_id, 20*60)
	.exec(function (err, replies) {
            //console.log("parse_ActMsg   redisMULTI got ".red + replies.length + " replies");
            replies.forEach(function (reply, index) {
               // console.log("Reply " + index + ": " + reply.toString());
            });
    });
	
function checkExpires(){
	//grab the expire set	
	console.log("check expires ".red);
	redisClient.multi()
	.smembers('train', function(err, trains){
			  if(trains != null){
		        var i = 0;
				trains.forEach(function(key){
				    //console.log("train     "+key);
					var train_id = key;
					//timer exists check the ttl on it
					redisClient.ttl("train_id:"+train_id, function(err, ttl){
							//the ttl is two hours and if it is under
							//a half hour we delete it
							//console.log("train id "+train_id+"    "+ttl);
							if(ttl < 20){
							    console.log("delete  ".red+train_id);
								redisClient.del("train_id:"+train_id);
								redisClient.srem('train', train_id);
							}
							
					});
					// get train id
				    redisClient.hget("train_id:"+key,'uid',function(err, train_uid){   
					     //console.log(train_id+"   "+train_uid);
					});
					i++;
				});
		      }
			  console.log('..........................................'+i);
	})
	.exec(function (err, replies) {
            console.log("MULTI got " + replies.length + " replies");
            replies.forEach(function (reply, index) {
                console.log("Reply " + index + ": " + reply.toString());
            });
    });
	
};	

setInterval(checkExpires, 30*1000  );
*/

// for admin
app.get('/lab/vmcode/all',function(req,res,next){
    vm.getVirtualServers(function(err,data){
	    if(err) res.send(400);
		else res.send(200,data);
	})
})

app.put('/lab/vmcode/stopall',function(req,res,next){
    console.log('stopall');
    vm.stopAllVirtualServers(function(err,data){   
		if(err){
				res.send(500,{'error':err});		
			}else{
				res.send(200,data);		
		}		     
	});
})


///////////////////////////////////////////////////////////////////

app.put('/lab/vmcode/start',function(req,res,next){
    var token = req.query.token, filename = req.query.name;
	console.log('vmcode start '.green, token, "    ",filename  );
	var path = '../fablab/public/coding/'+token+'/'+filename;
	fs.exists(path, function (exists) {
        if(exists){
		    console.log('file exists, so start server'.green);
			vm.createVirtualServer("utils/server_test.js",5000,function(err,data){   
			    if(err){
				    res.send(500,{'error':err});		
				}else{
				    console.log( data.pid); 
				    res.send(200,data);		
				}		     
		    });		    
		}else{
		    console.log('file do not exist, so no start server'.red);
		    res.send(404);		
		}	
	})
})

app.put('/lab/vmcode/stop',function(req,res,next){
    var token = req.query.token, filename = req.query.name;
	console.log('vmcode stop '.green, token, "    ",filename  );
    var path = '../fablab/public/coding/'+token+'/'+filename;		
	fs.exists(path, function (exists) {
        if(exists){
		    console.log('file exists, so stop server'.green);
			/*
            vm.endVirtualServer(5000,function(err,data){   
			    if(err){
				    res.send(500,{'error':err});		
				}else{
				    console.log( data.pid); 
				    res.send(200,data);		
				}		     
		    });
            */
			
		}else{
		    console.log('file do not exist, so no stop server'.red);
		    res.send(404);		
		}	
	})
})



	
app.get('/lab/vmcode',function(req, res,next){
   var token = req.query.token;
   if(token == null){
		token = (Math.random() * 1e18).toString(36);
		var path = '../fablab/public/coding/'+token;
        fs.exists(path, function (exists) {			    
            console.log('create a token, exists: ' + JSON.stringify(exists));
			if(exists==true){
			    // ERROR, that the filename is duplicated
				console.log('problem , the path exists '.red, token);
			}else{
			    fs.mkdir(path,0755,function(err,data){
		            if (err) {  console.log('failed to create directory   '.red+err);return next( err );}
			        else{
					    console.log('create a directory sucessfully, redirect'.green);
			            return res.redirect('/lab/vmcode?token='+token);	
                    }			
		        }) 
			}
        });				
   }
   else{
        var path = '../fablab/public/coding/'+token;
        fs.exists(path, function (exists) {
            if(exists==true){
			    // get info of all files 
				console.log('file:',token," existed".green);
				fs.readdir(path, function(err, files){
		            if (err) {
					    // ERROR, tell the user that the files don't existed anymore
					    return next( err );
					}	
					var dir = [];
					var readFile = function(file,callback){
					    fs.readFile(path+"/"+file, 'utf8', function (err,code) {
                            if (err) {
                                 console.log(err);
                            }else{
							    dir.push( {"src": path+"/"+file,'name':file,'code':code} );
							}
							callback();
                        });
					}
					async.each(files, readFile, function(err){
						if(req.xhr)
						res.send(200,{'files':dir});
						else
						res.render('lab/server/app');   // render the page and give the url a specific query 
                    });
	            });
			    
			}else{
			    // ERROR , tell the user that the files don't existed anymore
				console.log('file:',token," don't existed".red);
			}
        })		
   }
})
	
app.post('/lab/vmcode', uploadCode);   // get random token for anomy user identity, token is the directory name
function uploadCode(req,res,next){
    var token = req.query.token;
	console.log('upload the file with token   ',token);
	var file;
	var code_path,code_name,code_type, code_size;
	if(req.files.image!=null) file = req.files.image; 
	else file = req.files.qqfile;
	code_path = file.path; code_name = file.name; code_type = file.type; code_size = file.size;
    console.log('code_type ',code_type, code_name);
	if(code_type == 'text/html'){
	
	}else if(code_type == 'application/javascript'){    // javascript code
	
	}else if(code_type == 'application/octet-stream'){   // might python
	
	}else {
	    return res.send(400,{'error':"type invalid"});
	}
	
	var dir = './public';
	var file_path = '/coding/'+token+"/"+code_name;
	var target_path = dir+ file_path;
	console.log('target path:',target_path);

    // TODO : check the repository is created or not, if not ,create one
    	
	fs.rename(code_path,target_path,function(err){
		if(err) {  next(err);}	
		else{			
			fs.readFile(target_path, 'utf8', function(error, code) {
			    if(error) {
				  res.send(JSON.stringify({success: false, error: err}), {'Content-Type': 'application/json'}, 200);
			    } else {
                    console.log('upload user coding to Folder success'.green);
				    res.send({"src": file_path,'name':code_name,'code':code}, {'Content-Type': 'application/json'}, 200);
			    }
			})
		}				
	})	
}

app.put('/lab/vmcode', saveCode);
function saveCode(req,res,next){
    var token = req.query.token, filename = req.query.name;
	var code = req.body.code;
	console.log('code , ',code);
    var path = '../fablab/public/coding/'+token+'/'+filename;
	fs.exists(path, function (exists) {
        if(exists){
		    console.log('file exists, so update'.green);
			fs.writeFile(path, code, function(err) {
                if(err) {
                    console.log(err);
					res.send(500,err);	
                } else {
                    console.log("The file was saved!");
					res.send(200);
                }
            });			
		    
		}else{
		    console.log('file do not exist, so no update');
		    res.send(404);		
		}	
	})
} 

app.del('/lab/vmcode',deleteCode);
function deleteCode(req, res, next){
    var token = req.query.token, filename = req.query.name;
    var path = '../fablab/public/coding/'+token+'/'+filename;
	fs.exists(path, function (exists) {
        if(exists){
		    console.log('file exists, so delete'.green);			
			fs.unlink(path,function(err) {
                if(err) {
                    console.log(err);
					res.send(500,err);	
                } else {
                    console.log("The file was deleted!");
					res.send(200);
                }
            });			
		    
		}else{
		    console.log('file do not exist, so no delete');
		    res.send(404);		
		}	
	})
}