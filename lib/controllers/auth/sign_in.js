'use strict';

var Util = require('../util');

exports.get = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/admin/dashboard');
  } else {
    var util = new Util(req, res);
    util.render('auth/sign_in', '登录', {}, 'single');
  }
}

exports.post = function(req, res, next) {
  var workflow = require('../../workflow')(req, res);
  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.error.for.username = '请输入用户名';
      workflow.outcome.error.message.push('请输入用户名');
    }

    if (!req.body.password) {
      workflow.outcome.error.for.password = '请输入密码';
      workflow.outcome.error.message.push('请输入密码');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('attemptLogin');
  });

  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        workflow.outcome.error.message.push('用户名/密码错误，或者账号不可用');
        workflow.outcome.error.message.push('如果是新注册的账号，请联系管理员激活帐号。');
        return workflow.emit('response');
      }
      else {
        req.login(user, function(err) {
          if (err) return next(err);
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
}