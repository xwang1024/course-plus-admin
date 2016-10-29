'use strict';

const _         = require('lodash');
const async     = require('async');
const Validator = require('node-validator');
const Util      = require('../util');

let washResult = require('./index').washResult;

exports.index = function(req, res, next) {
  let util  = new Util(req, res);
  let Question = req.app.model.Question;
  let Author = req.app.model.Author;
  let Topic = req.app.model.Topic;
  let User = req.app.model.User;
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
  queryOptions.include = [{
    model: User
  }, {
    model: Topic,
    include: [ Author ]
  }];
  queryOptions.attributes = {
    exclude: ['replyContent']
  }
  
  Question.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }
    resData.result = result.rows;
    util.render('question/index', '提问管理', resData);
  }).catch(next);
};

exports.reply = function(req, res, next) {
  let util  = new Util(req, res);
  let Question = req.app.model.Question;
  let Author = req.app.model.Author;
  let Topic = req.app.model.Topic;
  let User = req.app.model.User;
  let id    = req.params.id;

  let resData = {};
  Question.findById(id, {
    include: [{
      model: User
    }, {
      model: Topic,
      include: [ Author ]
    }]
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
    util.render('question/reply', '提问回复', resData);
  }).catch(next);
};