'use strict';

const _       = require('lodash');
const express = require('express');
const router  = express.Router();

const prefix = '/api';

module.exports = exports = function () {
  router.get('/', (req, res) => { return res.redirect('/dashboard') });
  
  // 权限接口
  router.post(prefix + '/auth/signIn', require('../controllers/auth/sign_in').post);
  router.post(prefix + '/auth/signOut', require('../controllers/auth/sign_out').post);

  // restful接口
  // router.all('/*', ensureAuthenticated);
  let modelList = ['admin', 'asset', 'attachment', 'author', 'comment', 'course', 'school', 'speciality', 'topic', 'topicBody', 'user']
  modelList.forEach(function(model) {
    let snakeModelName = _.snakeCase(model);
    router.get    (prefix + `/${model}`,     require(`../controllers/${snakeModelName}`).get    );
    router.get    (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).getById);
    router.post   (prefix + `/${model}`,     require(`../controllers/${snakeModelName}`).post   );
    router.put    (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).put    );
    router.delete (prefix + `/${model}/:id`, require(`../controllers/${snakeModelName}`).delete );
  });

  // 页面路由
  router.get(`/dashboard` , require(`../controllers/dashboard/view`).index);
  router.get(`/user`      , require(`../controllers/user/view`).index);
  router.get(`/school`    , require(`../controllers/school/view`).index);
  router.get(`/speciality`, require(`../controllers/speciality/view`).index);
  router.get(`/course`    , require(`../controllers/course/view`).index);
  router.get(`/author`    , require(`../controllers/author/view`).index);
  router.get(`/topic`     , require(`../controllers/topic/view`).index);
  router.get(`/attachment`, require(`../controllers/attachment/view`).index);
  router.get(`/comment`   , require(`../controllers/comment/view`).index);
  router.get(`/asset`     , require(`../controllers/asset/view`).index);
  router.get(`/account`   , require(`../controllers/account/view`).index);
  
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