var fs = require('fs');
var requirejs = require('requirejs');

function getPluginList(folder, callback) {
    console.log('getPluginList...');
    var pluginList = [];
    var files = fs.readdirSync(folder);

    function requireRecursive(files) {
      var file = files.pop();
	  console.log('lala',file,folder + '/' + file);	   
	  require(  folder +"/"+ file + '/index.js', function(Plugin) {
	       console.log('plugin .....'+Plugin);
	  });
	  
	  
	  if(files.length>0)
	  requireRecursive(files);
	  /* 
      require([folder + '/' + file + '/index.js'], function(Plugin) {
        //pluginList.push(new Plugin(that.app));
		console.log('plugin .....'+Plugin);
        if (files.length>0) {
          //requireRecursive(files);
        } else {
          
        }
      });
	  */
    }

    requireRecursive(files);
};

// http://expressjs.com/api.html
function render(plugin, name){
    app.renderFile(__dirname + '/../plugins/' + plugin + '/views/' + name + '.ejs', {}, function(err, result) {
              if (!err) {
                html.append(result);
              } else {
                console.log(err);
              }
    });
}


exports.getPluginList = getPluginList;
exports.render = render;