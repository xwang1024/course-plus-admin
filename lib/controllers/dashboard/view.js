'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

exports.index = function(req, res, next) {
  var util = new Util(req, res);
  util.render('dashboard/index', '控制台', {});
};

exports.detail = function(req, res, next) {

};

exports.create = function(req, res, next) {

};

exports.modify = function(req, res, next) {

};