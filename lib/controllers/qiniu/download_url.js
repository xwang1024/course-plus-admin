'use strict';

exports.get = function(req, res, next) {
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
  let key    = req.query.key;

  let resData = {};
  if(!key) {
    resData.success = false;
    resData.error = {
      message: "key is required"
    }
  }

  var url = `http://${config.qiniu.domain}/${key}`;
  var policy = new qiniu.rs.GetPolicy();
  var downloadUrl = policy.makeRequest(url);
  resData.success = true;
  resData.downloadUrl = downloadUrl
  return res.send(resData);
};