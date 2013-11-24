var util = require('util'),
	path = require('path'),
    fs = require('fs'),
    async = require('async'),
    color = require('colors'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    crypto = require('crypto')
	//,jsonld = require('jsonld')
    ;
	
var app = require('../app').app,
    gridfs = require("./gridfs"),
    logger = require('../utils/logging.js'),
    config = require('../conf/config.js');
/*
https://www.duo.uio.no/bitstream/handle/10852/34167/Hassel-Master.pdf?sequence=1
https://github.com/digitalbazaar/jsonld.js
https://payswarm.com/slides/2013/banodejs-jsonld/index.html#
http://www.w3.org/TR/json-ld-api/
https://plus.google.com/+ManuSporny/posts/T5WkpieNrjJ
http://json-ld.org
http://queue.acm.org/detail.cfm?id=2187821
http://manu.sporny.org/2013/gmail-json-ld/
http://www.bbc.co.uk/ontologies/storyline/2013-05-01.html
http://manu.sporny.org/2013/json-ld-is-the-bees-knees/
http://www.slideshare.net/stormpath/rest-jsonapis

http://json-ld.org/playground/index.html

http://www.slideshare.net/gkellogg1/jsonld-and-mongodb
http://www.slideshare.net/lanthaler/jsonld-for-restful-services
http://www.slideshare.net/lanthaler/model-your-application-domain-not-your-json-structures-21175665
http://www.slideshare.net/lanthaler/building-next-generation-web-ap-is-with-jsonld-and-hydra
http://www.markus-lanthaler.com/research/on-using-json-ld-to-create-evolvable-restful-services.pdf





webhooks
http://apiux.com/2013/09/12/webhooks/
http://resthooks.org
http://www.stormpath.com/blog/secure-your-rest-api-right-way
http://www.mobify.com/blog/beginners-guide-to-http-cache-headers/
http://www.pubnub.com/blog/extend-rabbitmq-into-mobile-and-web-using-pubnub/
http://toddfredrich.com/ids-in-rest-api.html

http://blog.doordash.com/post/63387494835/implementing-rest-apis-with-embedded-privacy
http://www.codeproject.com/Articles/297160/AMQP-provider-RabbitMQ
https://github.com/NarrativeScience/Log.io
http://queue.acm.org/detail.cfm?id=2482856


webrtc
http://blog.vline.com/post/52644825765/tunneling-webrtc-over-tcp-and-why-it-matters
http://www.nojitter.com/post/240153948/webrtc-infrastructure-is-tricky

*/	

/*
var doc = {
  "http://schema.org/name": "Manu Sporny",
  "http://schema.org/url": {"@id": "http://manu.sporny.org/"},
  "http://schema.org/image": {"@id": "http://manu.sporny.org/images/manu.png"}
};
var context = {
  "name": "http://schema.org/name",
  "homepage": {"@id": "http://schema.org/url", "@type": "@id"},
  "image": {"@id": "http://schema.org/image", "@type": "@id"}
};

// compact a document according to a particular context
// see: http://json-ld.org/spec/latest/json-ld/#compacted-document-form
jsonld.compact(doc, context, function(err, compacted) {
  console.log(JSON.stringify(compacted, null, 2));
  
});
*/

/* Output:
  {
    "@context": {...},
    "name": "Manu Sporny",
    "homepage": "http://manu.sporny.org/",
    "image": "http://manu.sporny.org/images/manu.png"
  }
  */