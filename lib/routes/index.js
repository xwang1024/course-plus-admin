'use strict';

const _       = require('lodash');
const express = require('express');
const router  = express.Router();

const prefix = '/api';

module.exports = exports = function () {
  // router.get('/',        (req, res) => { return res.redirect('/admin/dashboard') });
  // router.get( '/v1/signIn', require('../controllers/auth/sign_in').get);
  
  // ===== api接口 =====
  // router.all('/*', ensureAuthenticated);

  // ===== api接口 =====
  // router.post(prefix + '/auth/signIn', require('../controllers/auth/sign_in').post);
  // router.post(prefix + '/auth/signOut', require('../controllers/auth/sign_out').post); // TODO

  // restful接口
  // , 'course', 'school', 'speciality', 'topic', 'topicBody', 'user'
  let modelList = ['admin', 'asset', 'attachment', 'author', 'comment']
  modelList.forEach(function(model) {
    let snakeModelName = _.snakeCase(model);
    router.get    (prefix + `/${model}`,     require(`../controllers/${snakeModelName}`).get    ); // TODO
    router.get    (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).getById); // TODO
    router.post   (prefix + `/${model}`,     require(`../controllers/${snakeModelName}`).post   ); // TODO
    router.put    (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).put    ); // TODO
    router.delete (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).delete ); // TODO
  });

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