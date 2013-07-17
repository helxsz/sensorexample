var crypto = require('crypto')
  , fs = require('fs')
  , logging = require('./logging')
  , spawn = require('child_process').spawn
  , Step = require('step')
;

/*
 * generate_keypair()
 *
 * Fork a child process to run ssh-keygen and generate a DSA SSH Key Pair
 * with no passphrase. Does not return the contents of the keys, leaves them
 * on the filesystem.
 *https://github.com/ericvicenti/csr-gen  
 https://github.com/andris9/pem/blob/master/lib/pem.js
 http://stackoverflow.com/questions/8520973/how-to-create-a-pair-private-public-keys-using-node-js-crypto
 http://stackoverflow.com/questions/8076834/nodejs-exec-with-binary-from-and-to-the-process
 * <ghLogin> Github login. Will be used to generate a unique user@host aka comment field in pubkey.
 * <path> Base output file path. Pubkey will be path + ".pub".
 * <callback> function(exitcode)
 */
var generate_keypair = exports.generate_keypair = function(ghLogin, path, callback)
{

  var cmd = "ssh-keygen";
  var random_str = crypto.randomBytes(8).toString('hex');
  var comment_field = ghLogin + "-" + random_str + "@StriderApp.com";
  var args = ["-t", "dsa", "-N", "", "-C", comment_field,  "-f", path];
  console.debug("generate_keypair() command: %s args: %s", cmd, args);
  Step(
    function stepOne() {
      try {
        fs.unlink(path, this.parallel());
        fs.unlink(path + ".pub", this.parallel());
      } catch(e) {
        // do nothing
      };
    },
    function stepTwo() {
      var keyp = spawn(cmd, args);

      keyp.on("exit", function(code) {
        callback(code);
      });
    }
  );

}
