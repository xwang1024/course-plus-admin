'use strict';

const _         = require('lodash');
const validator = require('node-validator');

function washResult(result) {
  return _.pick(result, ['id', 'name', 'icon', 'avatar', 'phone', 'email', 'qq', 'wechat', 'introduction']);
}

exports.get = function(req, res, next) {
  let util  = require('../util')(req, res);
  let Author = req.app.model.Author;
  let query = req.query;

  let queryOptions = {};
  let resData = {};
  // 需要获取那些字段
  queryOptions.attributes = {};
  queryOptions.attributes.exclude = ['deletedAt'];
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
  
  Author.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }
    resData.result = result.rows;
    res.send(resData);
  }).catch(util.sendError);
};

exports.getById = function(req, res, next) {
  let util  = require('../util')(req, res);
  let Author = req.app.model.Author;
  let id    = req.params.id;

  let resData = {};
  Author.findById(id).then((result) => {
    if(result) {
      resData.success = true;
      resData.result = washResult(result)
    } else {
      resData.success = false;
      resData.error = {
        message: 'Cannot find this id'
      };
    }
    res.send(resData);
  }).catch(util.sendError);
};

exports.post = function(req, res, next) {
  let util  = require('../util')(req, res);
  let Author = req.app.model.Author;
  let body  = req.body;
  
  let resData = {};
  let check = validator
                .isObject()
                .withRequired('name', validator.isString())
                .withOptional('icon', validator.isString())
                .withOptional('avatar', validator.isString())
                .withOptional('phone', validator.isString())
                .withOptional('email', validator.isString())
                .withOptional('qq', validator.isString())
                .withOptional('wechat', validator.isString())
                .withOptional('introduction', validator.isString());
  // 验证body
  body = _.pick(body, ['name', 'icon', 'avatar', 'phone', 'email', 'qq', 'wechat', 'introduction']);
  validator.run(check, body, function(errorCount, errors) {
    if(errorCount) {
      resData.success = false;
      resData.error = {
        message: errors.map((error) => {
          return `Validate ${error.parameter} error, ${error.message}`;
        })
      };
      return res.send(resData);
    }
    Author.create(body).then((result) => {
      resData.success = true;
      resData.result = washResult(result);
      return res.send(resData);
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = require('../util')(req, res);
  let Author = req.app.model.Author;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = validator
                .isObject()
                .withOptional('name', validator.isString())
                .withOptional('icon', validator.isString())
                .withOptional('avatar', validator.isString())
                .withOptional('phone', validator.isString())
                .withOptional('email', validator.isString())
                .withOptional('qq', validator.isString())
                .withOptional('wechat', validator.isString())
                .withOptional('introduction', validator.isString());
  // 验证body
  body = _.pick(body, ['name', 'icon', 'avatar', 'phone', 'email', 'qq', 'wechat', 'introduction']);
  validator.run(check, body, function(errorCount, errors) {
    if(errorCount) {
      resData.success = false;
      resData.error = {
        message: errors.map((error) => {
          return `Validate ${error.parameter} error, ${error.message}`;
        })
      };
      return res.send(resData);
    }
    // 检查id是否存在
    Author.findById(id).then((workingAuthor) => {
      if(!workingAuthor) {
        resData.success = false;
        resData.error = {
          message: `Author "${id}" has not existed.`
        };
        return res.send(resData);
      }
      workingAuthor.update(body).then(function(result) {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = require('../util')(req, res);
  let Author = req.app.model.Author;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Author.findById(id).then((workingAuthor) => {
    if(!workingAuthor) {
      resData.success = false;
      resData.error = {
        message: `Author "${id}" has not existed.`
      };
      return res.send(resData);
    }
    workingAuthor.destroy().then((result) => {
      resData.success = true;
      resData.result = washResult(result)
      return res.send(resData);
    }).catch(util.sendError);
  });
};