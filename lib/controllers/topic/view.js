'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');
let washResult  = require('./index').washResult;

exports.index = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let Course = req.app.model.Course;
  let Speciality = req.app.model.Speciality;
  let School = req.app.model.School;
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
  queryOptions.include = [{
    model: Course,
    include: [{
      model: Speciality,
      include: [ School ]
    }]
  }, {
    model: Author
  }];
  
  Topic.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }
    resData.result = result.rows;
    util.render('topic/index', '知识点管理', resData);
  }).catch(next);
};

exports.detail = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let TopicBody  = req.app.model.TopicBody;
  let Author     = req.app.model.Author;
  let Course     = req.app.model.Course;
  let Speciality = req.app.model.Speciality;
  let School     = req.app.model.School;
  let id         = req.params.id;

  let resData = {};
  Topic.findById(id, {
    include: [{
      model: TopicBody
    }, {
      model: Author
    }, {
      model: Course,
      include: [{
        model: Speciality,
        include: [ School ]
      }]
    }]
  }).then((result) => {
    if(result) {
      resData.success = true;
      resData.result = washResult(result)
    } else {
      resData.success = false;
      resData.error = {
        message: 'Cannot find this id'
      };
    }
    util.render('topic/detail', '知识点详情', resData);
  }).catch(next);
};

exports.create = function(req, res, next) {
  var util = new Util(req, res);
  util.render('topic/create', '创建知识点', {});
};

exports.modify = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let TopicBody  = req.app.model.TopicBody;
  let Author     = req.app.model.Author;
  let Course     = req.app.model.Course;
  let Speciality = req.app.model.Speciality;
  let School     = req.app.model.School;
  let id         = req.params.id;

  let resData = {};
  Topic.findById(id, {
    include: [{
      model: TopicBody
    }, {
      model: Author
    }, {
      model: Course,
      include: [{
        model: Speciality,
        include: [ School ]
      }]
    }]
  }).then((result) => {
    if(result) {
      resData.success = true;
      resData.result = washResult(result)
    } else {
      resData.success = false;
      resData.error = {
        message: 'Cannot find this id'
      };
    }
    util.render('topic/modify', '修改知识点', resData);
  }).catch(next);
};