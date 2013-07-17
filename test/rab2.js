var amqp = require('amqp');

function safeEndConnection(connection) {

    connection.queue('tmp-' + Math.random(), {exclusive: true}, function(){
        connection.end();

        // `connection.end` in 0.1.3 raises a ECONNRESET error, silence it:
        connection.once('error', function(e){
            if (e.code !== 'ECONNRESET' || e.syscall !== 'write')
                throw e;
        });
    });

}


var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
    connection.publish('hello', 'Hello World!1111111');
    console.log(" [x] Sent 'Hello World!'");

    //safeEndConnection(connection);
	

        connection.publish('task_queue', 'messageafad 1s  sssss'+Math.random(100), {deliveryMode: 2});
		connection.publish('task_queue', 'messageafad 2s  sssss'+Math.random(100), {deliveryMode: 2});
		connection.publish('task_queue', 'messageafad 3s  sssss'+Math.random(100), {deliveryMode: 2});
		connection.publish('task_queue', 'messageafad 4s  sssss'+Math.random(100), {deliveryMode: 2});
		connection.publish('task_queue', 'messageafad 5s  sssss'+Math.random(100), {deliveryMode: 2});
		connection.publish('task_queue', 'messageafad 6s  sssss'+Math.random(100), {deliveryMode: 2});
        console.log(" [x] Sent %s", 'message afadfadf');
    
	
	
	connection.exchange('logs', {type: 'fanout',autoDelete: false}, function(exchange){
                                 
        exchange.publish('', 'Hello World````````!');
        console.log("exchange [x] Sent %s", 'Hello World`````````````!');

    });
	
        safeEndConnection(connection);
    
	
});