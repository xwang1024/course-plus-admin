'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'content', 'isSolved', 'remark', 'tradeId', 'userId', 'user', 'trade', 'createdAt', 'updatedAt']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let Feedback = req.app.model.Feedback;
  let User  = req.app.model.User;
  let Trade = req.app.model.Trade;
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
  queryOptions.include = [ User, Trade ];
  
  Feedback.findAndCountAll(queryOptions).then((result) => {
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
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
  let util  = new Util(req, res);
  let Feedback = req.app.model.Feedback;
  let User = req.app.model.User;
  let Trade = req.app.model.Trade;
  let id    = req.params.id;

  let resData = {};
  Feedback.findById(id, {
    include: [ User, Trade ]
  }).then((result) => {
    if(result) {
      resData.success = true;
      resData.result = washResult(result.dataValues);
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
  let util  = new Util(req, res);  
  let resData = {};
  resData.success = false;
  resData.error = {
    message: 'Cannot add feedback'
  };
  return res.send(resData);
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Feedback = req.app.model.Feedback;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('isSolved', Validator.isBoolean())
                .withOptional('remark', Validator.isString());
  // 验证body
  body = _.pick(body, ['isSolved', 'remark']);
  Validator.run(check, body, function(errorCount, errors) {
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
    Feedback.findById(id).then((workingFeedback) => {
      if(!workingFeedback) {
        resData.success = false;
        resData.error = {
          message: `Feedback "${id}" has not existed.`
        };
        return res.send(resData);
      }
      workingFeedback.update(body).then(function(result) {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);  
  let resData = {};
  resData.success = false;
  resData.error = {
    message: 'Cannot delete feedback'
  };
  return res.send(resData);
};