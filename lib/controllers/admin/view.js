'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

exports.index = function(req, res, next) {
  let util  = new Util(req, res);
  let Admin = req.app.model.Admin;
  let query = req.query;

  let queryOptions = {};
  let resData = {};
  // 需要获取那些字段
  queryOptions.attributes = {};
  queryOptions.attributes.exclude = ['password', 'deletedAt'];
  if(query.attributes instanceof Array) {
    queryOptions.attributes.include = query.attributes;
    
  }
  // 查询条件
  if(query.filter && typeof(query.filter) === 'object') {
    queryOptions.where = query.filter;
  }
  // 排序
  if(typeof(query.order) === 'string') {
    queryOptions.order = query.order;
  }
  // 需要分页
  if(!query.noPagination) {
    let page = (parseInt(query.page) || 1) - 1;
    let pageSize = parseInt(query.pageSize) || 15;
    queryOptions.offset = page * pageSize;
    queryOptions.limit = pageSize;
    resData.page = page + 1;
    resData.pageSize = pageSize;
  }
  
  Admin.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }
    resData.result = result.rows;
    util.render('admin/index', '运营账号管理', resData);
  }).catch(next);
};

exports.detail = function(req, res, next) {

};

exports.create = function(req, res, next) {

};

exports.modify = function(req, res, next) {

};