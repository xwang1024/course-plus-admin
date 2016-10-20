'use strict';

const qiniu = require('qiniu');

exports.get = function(req, res, next) {
  let config = req.app.config;
  let key    = req.query.key;

  let resData = {};
  if(!key) {
    resData.success = false;
    resData.error = {
      message: "key is required"
    }
  }

  qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

  var url = `http://${config.qiniu.domain}/${key}`;
  var policy = new qiniu.rs.GetPolicy();
  var downloadUrl = policy.makeRequest(url);
  console.log(downloadUrl);
  resData.success = true;
  resData.downloadUrl = downloadUrl
  return res.send(resData);
};