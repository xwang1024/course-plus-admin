'use strict';

var express = require('express');
var router = express.Router();

module.exports = exports = function () {
  router.get('/',        (req, res) => { return res.redirect('/admin/dashboard') });
  router.get( '/signIn', require('../controllers/auth/sign_in').get);
  router.post('/signIn', require('../controllers/auth/sign_in').post);

  router.all('/admin*', ensureAuthenticated);
  router.get('/admin/dashboard', require('../controllers/dashboard').get);

  return router;
};

// 登录检查
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/signIn');
}

// 管理权限检查
function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('su')) {
    return next();
  }
  res.status(403).send('您没有权限执行该操作').end();
}