//var utils = require("./utils");
//https://raw.github.com/Wyverald/net9-auth/master/appbase-mongo.js
var mongoose = require('../app').mongoose;
var ObjectId = mongoose.Schema.ObjectId;
require('colors');

mongoose.model('App', new mongoose.Schema({
  name:     { type: String, index: true },
  cid: { type: String, index: true },
  secret:   String,
  desc:     String,
  owners:   [String]
}));
var App = mongoose.model('App');

exports.getAllByUser = function (username, callback) {
  App.find({ owners: username }, function (err, arr) {
    callback(true, arr.map(function (app) { return app.toObject(); }));
  });
};

exports.checkByName = function (appname, callback) {
  App.count({ name: appname }, function (err, count) {
    callback(count !== 0);
  });
};

exports.create = function (appinfo, callback) {
  var newApp = new App(appinfo);
  newApp.save(function (err) {
    if (err) callback(false, err);
    else callback(true, newApp.toObject());
  });
};

exports.getByID = function (cid, callback) {
  App.findOne({ cid: cid }, function (err, app) {
    if (app === null) callback(false, 'app-not-found');
    else callback(true, app.toObject());
  });
};

exports.deleteByID = function (cid, callback) {
  App.remove({ cid: cid }, function (err) {
    callback(err ? false : true, err);
  });
};

exports.authenticate = function (cid, secret, callback) {
  App.findOne({ cid: cid }, function (err, app) {
    if (app === null) callback(false, 'no-such-app-cid');
    else if (app.secret !== secret) callback(false, 'wrong-secret');
    else callback(true, app.toObject());
  });
};

exports.update = function (appinfo, callback) {
  App.findOne({ cid: appinfo.cid }, function (err, app) {
  /*
    utils.merge(app, appinfo).save(function (err) {
      if (err) callback(false, err);
      else callback(true, app.toObject());
    });
  */	
  });
};

