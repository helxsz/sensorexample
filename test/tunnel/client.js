

//http://blog.shinetech.com/2011/07/04/tlsssl-tunneling-with-nodejs/
var net = require('net'), sys = require('sys');
 
var msg = "Hello from net client!";
 
client = net.createConnection(7000, function() {
    sys.puts("Sending data: " + msg);
    client.write(msg);
});
 
client.addListener("data", function (data) {
    sys.puts("Received: " + data);
});
