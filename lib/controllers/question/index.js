'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'content', 'userEmail', 'replyContent', 'replyStatus', 'createdAt', 'updatedAt', 'userId', 'user', 'authorId', 'author']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let Question = req.app.model.Question;
  let User = req.app.model.User;
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
  queryOptions.include = [ User, Author ];
  
  Question.findAndCountAll(queryOptions).then((result) => {
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
  let Question = req.app.model.Question;
  let User = req.app.model.User;
  let Author = req.app.model.Author;
  let id    = req.params.id;

  let resData = {};
  Question.findById(id, {
    include: [ Question, User ]
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
    message: 'Cannot add question'
  };
  return res.send(resData);
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Question = req.app.model.Question;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('replyContent', Validator.isString());
  // 验证body
  body = _.pick(body, ['replyContent']);
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
    Question.findById(id).then((workingQuestion) => {
      if(!workingQuestion) {
        resData.success = false;
        resData.error = {
          message: `Question "${id}" has not existed.`
        };
        return res.send(resData);
      }
      // TODO 发送邮件

      workingQuestion.update(body).then(function(result) {
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
    message: 'Cannot delete question'
  };
  return res.send(resData);
};