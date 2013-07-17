var express = require('express'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    amqp = require('amqp');
//http://blog.appfog.com/tutorial-rabbitmq-node-js-on-appfog/https://github.com/lucperkins/backbone-blog
var app = express();

app.configure(function(){
  app.set('port', process.env.VCAP_APP_PORT || 13000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
  
/*

 /home
        /environment
            /power
                /<sensor>
            /temperature
                /currentcost


*/


  
	setTimeout(function(){
        var connection = amqp.createConnection({host: 'localhost'});
        connection.on('ready', function(){
		    console.log('on ready receive');
            connection.queue('hello', {autoDelete: false}, function(queue){
                console.log(' [*] Waiting for messages. To exit press CTRL+C')
                queue.subscribe(function(msg){
                   console.log(" [x] Received %s", msg.data.toString('utf-8'));
                });
            });
			
			connection.queue('task_queue', {autoDelete: false,durable: true}, function(queue){                                    
                
                queue.subscribe({ack: true, prefetchCount: 1}, function(msg){
                    var body = msg.data.toString('utf-8');
                    console.log("task queue1 [x] Received %s", body);
					queue.shift();
					/*
                    setTimeout(function(){
                       //console.log(" [x] Done");
                       queue.shift(); // basic_ack equivalent
                    }, (body.split('.').length - 1) * 1000);
					*/
                });
            });
			

			connection.queue('task_queue', {autoDelete: false,durable: true}, function(queue){                                    
                
                queue.subscribe({ack: true, prefetchCount: 1}, function(msg){
                    var body = msg.data.toString('utf-8');
                    console.log("task queue2 Received %s", body);
                    queue.shift();
					/*
                    setTimeout(function(){
                       //console.log(" [x] Done");
                        // basic_ack equivalent
                    }, (body.split('.').length - 1) * 1000);
					*/
                });
            });
			
			connection.queue('abc', {autoDelete: false,durable: true}, function(queue){                                    
                queue.bind('logs', '');
				queue.on('queueBindOk', function() { console.log('bind ok'); });
                queue.subscribe(function(msg){
                    console.log("logs [x] %s", msg.data.toString('utf-8'));
                });			
            });			
			
        });
	
	},300);  
});

app.connectionStatus = 'No server connection';
app.exchangeStatus = 'No exchange established';
app.queueStatus = 'No queue established';

app.get('/abc', function(req, res){
  console.log('abc');
  res.render('index1.jade', { title: 'Welcome to RabbitMQ and Node/Express on AppFog!',
    connectionStatus: app.connectionStatus,
    exchangeStatus: app.exchangeStatus,
    queueStatus: app.queueStatus
  });
});

function connectionUrl(){
  if (process.env.VCAP_SERVICES){
    conf = JSON.parse(process.env.VCAP_SERVICES);
    return conf['rabbitmq-2.4'][0].credentials.url;
  } else {
    return 'amqp://localhost';
  }
}

app.post('/start-server', function(req, res){
  app.rabbitMqConnection = amqp.createConnection({ url: connectionUrl() });

  app.rabbitMqConnection.on('ready', function(){
    console.log('ready ');
    app.connectionStatus = 'Connected!';
    res.redirect('/abc');
  });
});

app.post('/new-exchange', function(req, res){
  app.e = app.rabbitMqConnection.exchange('test-exchange',function (exchange) {
     console.log('exchange ' + exchange.name + ' is open');
     app.exchangeStatus = 'An exchange has been established!';
  });  
  
  app.e.on('open', function (exchange) {
     console.log('open openexchange ' + exchange + ' is open');
     app.exchangeStatus = 'An exchange has been established!';
  });
 
  res.redirect('/abc');
});

app.post('/new-queue', function(req, res){
  app.q = app.rabbitMqConnection.queue('test-queue',function (queue) {
     console.log('Queue ' + queue.name + ' is open');
     app.queueStatus = 'The queue is ready for use!';
  }).on('queueDeclareOk', function(args) {
      console.log('Total Consumers: ' + args.consumerCount);
  });  
  res.redirect('/abc');
});

app.get('/message-service', function(req, res){
  app.q.bind(app.e, '#');
  
  app.q.on('queueBindOk', function(){
    console.log('queueBindOk ');
  });
  
  res.render('message-service.jade',
    {
      title: 'Welcome to the messaging service!',
      sentMessage: ''
    });
});

app.post('/newMessage', function(req, res){
  var newMessage = req.body.newMessage;
  app.e.publish('routingKey', { message: newMessage });
  console.log('post message',newMessage);
  app.q.subscribe(function(msg){
    var messageToDisplay = msg.message;
    res.render('message-service.jade',
    {
        title: 'You\'ve got mail!',
        sentMessage: messageToDisplay
    });
    app.rabbitMqConnection.end();
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("what the fuck Express server listening on port " + app.get('port'));
});