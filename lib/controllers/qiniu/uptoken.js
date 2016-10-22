'use strict';


exports.get = function(req, res, next) {
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
  let resData = {};
  let bucketName = config.qiniu.bucketName;
  let putPolicy = new qiniu.rs.PutPolicy(bucketName);
  resData.uptoken = putPolicy.token();
  return res.send(resData);
};