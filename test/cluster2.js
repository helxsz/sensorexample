var cluster = require('cluster')

  var
      express = require( 'express' ),
      app     = express(),
      redis   = require( 'redis' ).createClient();

  app.configure( function() {
      app.set( 'view options', { layout: false } );
      app.set( 'view engine', 'jade' );
      app.set( 'views', __dirname + '/views' );
      app.use( express.bodyParser() );
  });

  function log( what ) { console.log( what ); }

  app.get( '/', function( req, res ) {
      redis.lrange( 'items', 0, 50, function( err, items ) {
            if( err ) { log( err ); } else {
              res.render( 'index', { items: items } );
            }
      });
  });


var numCPUs = require('os').cpus().length;

if ( cluster.isMaster ) {
      console.log("is master");
    for(var i=0;i<numCPUs;i++){
        cluster.fork();
    }
    cluster.on('death',function(worker){
            console.log('worker'+worker.id+' is death');
            cluster.fork();
    });
} else {

  console.log("not master");
  app.listen( 8080 );
}

