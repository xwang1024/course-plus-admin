'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

exports.index = function(req, res, next) {
  var util = new Util(req, res);
  util.render('author/index', '作者管理', {});

};

exports.detail = function(req, res, next) {
  var util = new Util(req, res);
  util.render('author/detail', '作者详情', {});

};

exports.create = function(req, res, next) {
  var util = new Util(req, res);
  util.render('author/create', '创建作者', {});

};

exports.modify = function(req, res, next) {
  var util = new Util(req, res);
  util.render('author/modify', '修改作者详情', {});
};