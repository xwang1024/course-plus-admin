'use strict';

const qiniu = require('qiniu');

exports.get = function(req, res, next) {
  let config = req.app.config;
  let resData = {};
  qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
  let bucketName = config.qiniu.bucketName;
  let putPolicy = new qiniu.rs.PutPolicy(bucketName);
  resData.uptoken = putPolicy.token();
  return res.send(resData);
};