'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

exports.signIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    var util = new Util(req, res);
    util.render('auth/sign_in', '登录', {}, 'single');
  }
};

exports.signUp = function(req, res, next) {

};

exports.signOut = function(req, res, next) {
  req.logout();
  res.redirect('/signIn');
};