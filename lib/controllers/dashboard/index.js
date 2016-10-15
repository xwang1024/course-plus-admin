'use strict';
var RanderUtil = require('../render_util');

exports.get = function (req, res, next) {
  var renderUtil = new RanderUtil(req, res);
  renderUtil.render('dashboard/index', '控制台', {});
};