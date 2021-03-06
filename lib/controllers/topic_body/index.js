'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'type', 'content', 'createdAt', 'updatedAt']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let TopicBody = req.app.model.TopicBody;
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
  
  TopicBody.findAndCountAll(queryOptions).then((result) => {
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
  let util  = new Util(req, res);
  let TopicBody = req.app.model.TopicBody;
  let id    = req.params.id;

  let resData = {};
  TopicBody.findById(id).then((result) => {
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
  let util  = new Util(req, res);
  let TopicBody = req.app.model.TopicBody;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('type', Validator.isString(/^(HTML)|(MARKDOWN)$/))
                .withRequired('content', Validator.isString());
  // 验证body
  body = _.pick(body, ['type', 'content']);
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
    TopicBody.create(body).then((result) => {
      resData.success = true;
      resData.result = washResult(result);
      return res.send(resData);
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let TopicBody = req.app.model.TopicBody;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('type', Validator.isString(/^(HTML)|(MARKDOWN)$/))
                .withOptional('content', Validator.isString());
  // 验证body
  body = _.pick(body, ['type', 'content']);
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
    TopicBody.findById(id).then((workingTopicBody) => {
      if(!workingTopicBody) {
        resData.success = false;
        resData.error = {
          message: `TopicBody "${id}" has not existed.`
        };
        return res.send(resData);
      }
      workingTopicBody.update(body).then(function(result) {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);
  let TopicBody = req.app.model.TopicBody;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  TopicBody.findById(id).then((workingTopicBody) => {
    if(!workingTopicBody) {
      resData.success = false;
      resData.error = {
        message: `TopicBody "${id}" has not existed.`
      };
      return res.send(resData);
    }
    workingTopicBody.destroy().then((result) => {
      resData.success = true;
      resData.result = washResult(result)
      return res.send(resData);
    }).catch(util.sendError);
  });
};