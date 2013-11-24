var moment = require('moment');
var appModel = require('../model/appbase_model'),
    crypto = require('crypto');

exports.getAllByUser = function (username, callback) {
  appModel.getAllByUser(username, function (success, appsOrErr) {
    if (success) callback({ success: true, apps: appsOrErr });
    else callback({ success: false, error: appsOrErr });
  });
};

exports.checkByName = function (appname, callback) {
  appModel.checkByName(appname, function (occupied) {
    callback({ name: appname, occupied: occupied });
  });
};

exports.generateClientID = function (username, appname) {
  var hasher = crypto.createHash('sha1');
  hasher.update(username + '/' + appname);
  var digest = hasher.digest('base64');
  // In base64 notation the digest always ends with '='. So we lose that.
  // Also + and / might not be very URL-friendly. We replace those with - and _.
  return digest.slice(0, -1).replace(/\+/g, '-').replace(/\//g, '_');
};

exports.register = function (username, appinfo, callback) {
  // First make sure that no app by the same name exists.
  appModel.checkByName(appinfo.name, function (occupied) {
    if (occupied) callback({ success: false, appinfo: appinfo, error: 'app-name-taken' });
    else {
      appModel.create({
        name: appinfo.name,
        desc: appinfo.desc,
        owners: [username],
        cid: exports.generateClientID(username, appinfo.name),
        secret: appinfo.secret
      }, function (success, appOrErr) {
        if (success) callback({ success: true, appinfo: appOrErr });
        else callback({ success: false, appinfo: appinfo, error: appOrErr });
      });
    }
  });
};

exports.getByID = function (cid, callback) {
  appModel.getByID(cid, function (success, appOrErr) {
    if (success) callback({ success: true, appinfo: appOrErr });
    else callback({ success: false, error: appOrErr });
  });
};

exports.deleteByID = function (cid, callback) {
  appModel.deleteByID(cid, function (success, err) {
    if (success) callback({ success: true });
    else callback({ success: false, error: err });
  });
};

exports.authenticate = function (appinfo, callback) {
  appModel.authenticate(appinfo.cid, appinfo.secret, function (success, appOrErr) {
    if (success) callback({ success: true, appinfo: appOrErr });
    else callback({ success: false, error: appOrErr });
  });
};

exports.updateInfo = function (appinfo, callback) {
  appModel.authenticate(appinfo.cid, appinfo.oldsecret, function (success, appOrErr) {
    if (success) {
      appModel.update({
        cid: appinfo.cid,
        name: appinfo.name,
        secret: appinfo.newsecret,
        desc: appinfo.desc
      }, function (success, appOrErr) {
        if (success) callback({ success: true, appinfo: appOrErr });
        else callback({ success: false, error: appOrErr });
      });
    } else {
      callback({
        success: false,
        error: appOrErr === 'wrong-secret' ? 'wrong-old-secret' : appOrErr
      });
    }
  });
};

