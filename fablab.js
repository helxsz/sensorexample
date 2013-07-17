var rootpath = process.cwd() + '/',
  path = require('path'),
  fs = require('fs'),
  events = require('events');
  
  var fablab = module.exports = {
  init:init,
  // Configuration exposed
  //
  data:{},
  modules:{}
};


function init(app, initCallback) {

  // Check if we need to reload the config from disk (e.g. from cluster mode)

  // Configure the logging

  // Check / Connect Mongo

}