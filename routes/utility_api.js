var crypto = require("crypto");//https://github.com/mozilla/node-client-sessions/blob/master/lib/client-sessions.jsvar crypto = require('crypto');var password = 'cube_xiaoer';var str = 'I love you';//console.log('string��' + str,encodeURIComponent(str));//str = encodeURIComponent(str);var cipher = crypto.createCipher("rc4", password);//var cipher = crypto.createCipher("aes256", password);var ciphered = cipher.update(str, "utf8", "hex");ciphered += cipher.final("hex");//console.log('ciphered��' + ciphered);var decipher = crypto.createDecipher("rc4", password);//var decipher = crypto.createDecipher("aes256", password);var deciphered = decipher.update(ciphered, "hex", "utf8");deciphered += decipher.final("utf8");//deciphered = decodeURIComponent(deciphered);//console.log('deciphered��' + deciphered);/////////////////////////////////////////////////////////function base64urlencode(arg) {  var s = new Buffer(arg).toString('base64');  s = s.split('=')[0]; // Remove any trailing '='s  s = s.replace(/\+/g, '-'); // 62nd char of encoding  s = s.replace(/\//g, '_'); // 63rd char of encoding  // TODO optimize this; we can do much better  return s;}function base64urldecode(arg) {  var s = arg;  s = s.replace(/-/g, '+'); // 62nd char of encoding  s = s.replace(/_/g, '/'); // 63rd char of encoding  switch (s.length % 4) // Pad with trailing '='s  {  case 0: break; // No pad chars in this case  case 2: s += "=="; break; // Two pad chars  case 3: s += "="; break; // One pad char  default: throw new InputException("Illegal base64url string!");  }  return new Buffer(s, 'base64'); // Standard base64 decoder}function deriveKey(master, type) {  // eventually we want to use HKDF. For now we'll do something simpler.  var hmac = crypto.createHmac('sha256', master);  hmac.update(type);  return hmac.digest('binary');}function encode(opts, content, duration, createdAt){    // format will be:    // iv.ciphertext.createdAt.duration.hmac    if (!opts.encryptionKey) {      opts['encryptionKey'] = deriveKey(opts.secret, 'cookiesession-encryption');    }    if (!opts.signatureKey) {      opts['signatureKey'] = deriveKey(opts.secret, 'cookiesession-signature');    }    duration = duration || 24*60*60*1000;    createdAt = createdAt || new Date().getTime();    // generate iv    var iv = crypto.randomBytes(16);    // encrypt with encryption key    var cipher = crypto.createCipheriv('aes256', opts.encryptionKey, iv);    var ciphertext = cipher.update(JSON.stringify(content), 'utf8', 'binary');    ciphertext += cipher.final('binary');    ciphertext = new Buffer(ciphertext, 'binary');    // hmac it    var hmacAlg = crypto.createHmac('sha256', opts.signatureKey);    hmacAlg.update(iv);    hmacAlg.update(".");    hmacAlg.update(ciphertext);    hmacAlg.update(".");    hmacAlg.update(createdAt.toString());    hmacAlg.update(".");    hmacAlg.update(duration.toString());    var hmac = hmacAlg.digest();    return base64urlencode(iv) + "." + base64urlencode(ciphertext) + "." + createdAt + "." + duration + "." + base64urlencode(hmac);}function decode(opts, content) {    // stop at any time if there's an issue    var components = content.split(".");    if (components.length != 5)      return;    if (!opts.encryptionKey) {      opts['encryptionKey'] = deriveKey(opts.secret, 'cookiesession-encryption');    }    if (!opts.signatureKey) {      opts['signatureKey'] = deriveKey(opts.secret, 'cookiesession-signature');    }    var iv = base64urldecode(components[0]);    var ciphertext = base64urldecode(components[1]);    var createdAt = parseInt(components[2]);    var duration = parseInt(components[3]);    var hmac = base64urldecode(components[4]);    // make sure IV is right length    if (iv.length != 16)      return;    // check hmac    var hmacAlg = crypto.createHmac('sha256', opts.signatureKey);    hmacAlg.update(iv);    hmacAlg.update(".");    hmacAlg.update(ciphertext);    hmacAlg.update(".");    hmacAlg.update(createdAt.toString());    hmacAlg.update(".");    hmacAlg.update(duration.toString());    var expected_hmac = hmacAlg.digest();    if (hmac.toString('utf8') != expected_hmac.toString('utf8'))      return;    // decrypt    var cipher = crypto.createDecipheriv('aes256', opts.encryptionKey, iv);    var plaintext = cipher.update(ciphertext, 'utf8');    plaintext += cipher.final('utf8');    try {      return {        content: JSON.parse(plaintext),        createdAt: createdAt,        duration: duration      }    } catch (x) {      return;    }}module.exports.util = {  encode: encode,  decode: decode};