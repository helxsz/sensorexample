/**
https://github.com/ericvicenti/csr-gen  
 https://github.com/andris9/pem/blob/master/lib/pem.js
 http://stackoverflow.com/questions/8520973/how-to-create-a-pair-private-public-keys-using-node-js-crypto
 http://stackoverflow.com/questions/8076834/nodejs-exec-with-binary-from-and-to-the-process
http://chschneider.eu/linux/server/openssl.shtml
 http://pages.cs.wisc.edu/~zmiller/ca-howto/
 http://blog.didierstevens.com/2008/12/30/howto-make-your-own-cert-with-openssl/
	   https://groups.google.com/forum/?fromgroups#!topic/nodejs/QD5cz01tfRI
	   http://docs.nodejitsu.com/articles/cryptography/how-to-use-the-tls-module
	   http://stackoverflow.com/questions/14383924/client-ssl-authorization-on-node-js
	   http://blog.james-carr.org/2010/07/26/using-an-ssl-certificate-to-make-a-secure-http-request-in-nodejs/
	   http://blog.nategood.com/nodejs-ssl-client-cert-auth-api-rest 
	   
	   http://stackoverflow.com/questions/4024393/difference-between-self-signed-ca-and-self-signed-certificate
	   
	   http://www.cnblogs.com/LevinJ/archive/2012/05/16/2503586.html
	   
	   http://bravenewmethod.wordpress.com/2010/12/09/apple-push-notifications-with-node-js/
在一个典型的TLS应用中，Client端的身份是不需要验证的，它一般通过密码机制实现。Server端身份则由第三方（Certificate Authority）提供的Certificate验证。TLS协议握手的步骤如下（简化版本）：
1)      ClientHello: Client向Server端发送Hello消息，启动握手。Hello消息包含自己有支持的SSL/TL版本，加解密算法及Key size.
2)      ServerHello: Server端选择匹配的SSL/TLS版本，加解密算法，并把这些信息返回给Client端
3)      Certificate: Server端发送自己的Certificate给Client。Certificate中包含Server的public key, domain name等。顺便提一句，public key与private key是一一对应的，经过public key加密的信息，从概率上来说，只有有private key的人才能解密。
4)      Validate Server Identify: Client与CA通信，确认Certificate中的public key与 domain name是合法有效的。
5)      Exchange secrete key: Secret key exchange: client端生成一个random的secret key, 并用public key加密。
6)      Exchange secrete key: Server端用private key解密被加密的secret key,这样Client与Server会share同一个secret key.
7)      利用同一个secret key, Client 与Server就可以加密解密接下来的所有消息通讯了（这是用的加解密算法为对称性加解密算法，诸如AES, Blowfish, Camellia, SEED等）。

	   
	   http://security.stackexchange.com/questions/27889/how-should-i-store-ssl-keys-on-the-server
	   You can use the "DHE" cipher suites for SSL. With these cipher suites, the server key is used for signatures,
	   not for encryption. This means that the attacker who steals your key can thereafter impersonate your server 
	   (i.e. run a fake server) but not decrypt SSL sessions which he previously recorded. This is a good property known as Perfect Forward Secrecy.
	   
	   https://gist.github.com/ExxKA/5169211
	   This architecture will allow you to have one web server communicating with an array of trusted clients, the web server itself can be on the public internet, that will not decrease the level of security, but it will only server trusted clients so it might aswell be on an internal network.
It is important you generate the CA yourself. The CA will control which client are authoried to connect to your application

Certificates

Create a Certificate Authority.
Create a server certificate and sign it.
Create a number of client certificates and sign all except one.


http://publib.boulder.ibm.com/infocenter/tivihelp/v5r1/index.jsp?topic=%2Fcom.ibm.itim.infocenter.doc%2Fcpt%2Fcpt_ic_security_ssl_authent2way.html

0后宅男、独男，网络控、技术控、编程控，迷恋机器的geek……  http://gutspot.com/page/5/
http://gutspot.com/2012/08/09/tlsssl%E5%8F%8C%E5%90%91%E9%AA%8C%E8%AF%81/

http://publib.boulder.ibm.com/infocenter/tivihelp/v5r1/index.jsp?topic=%2Fcom.ibm.itim.infocenter.doc%2Fcpt%2Fcpt_ic_security_ssl_authent2way.html

TLS/SSL tunneling with Node.js   http://blog.shinetech.com/2011/07/04/tlsssl-tunneling-with-nodejs/

http://www.codeproject.com/Articles/326574/An-Introduction-to-Mutual-SSL-Authentication

http://blog.shinetech.com/2011/07/04/tlsssl-tunneling-with-nodejs/

http://stackoverflow.com/questions/10175812/how-to-build-a-self-signed-certificate-with-openssl
**/
/*
var cp = require('child_process');

var privateKey, publicKey;
publicKey = '';
cp.exec('openssl genrsa 2048', function(err, stdout, stderr) {
  privateKey = stdout;
  console.log(privateKey);
  makepub = cp.spawn('openssl', ['rsa', '-pubout']);
  makepub.on('exit', function(code) {
    console.log(publicKey);
  });
  makepub.stdout.on('data', function(data) {
    publicKey += data;
  });
  makepub.stdout.setEncoding('ascii');
  makepub.stdin.write(privateKey);
  makepub.stdin.end();  
});


var util  = require('util'),
    spawn = require('child_process').spawn;

function sslencrypt(buffer_to_encrypt, callback) {
    var ssl = spawn('openssl', ['-encrypt', '-inkey', ',key_file.pem', '-certin']),
        result = new Buffer(SOME_APPROPRIATE_SIZE),
        resultSize = 0;

    ssl.stdout.on('data', function (data) {
        // Save up the result (or perhaps just call the callback repeatedly
        // with it as it comes, whatever)
        if (data.length + resultSize > result.length) {
            // Too much data, our SOME_APPROPRIATE_SIZE above wasn't big enough
        }
        else {
            // Append to our buffer
            resultSize += data.length;
            data.copy(result);
        }
    });

    ssl.stderr.on('data', function (data) {
        // Handle error output
    });

    ssl.on('exit', function (code) {
        // Done, trigger your callback (perhaps check `code` here)
        callback(result, resultSize);
    });

    // Write the buffer
    ssl.stdin.write(buffer_to_encrypt);
}
*/

var pem = require('pem');
  
pem.createPrivateKey(2048,function(err,key){

   console.log(key);
})