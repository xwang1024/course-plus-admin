'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'orderNo', 'orderStatus', 'cost', 'createdAt', 'updatedAt',
                         'userId', 'user', 'attachmentId', 'attachment', 'topicId', 'topic']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let Trade = req.app.model.Trade;
  let User = req.app.model.User;
  let Attachment = req.app.model.Attachment;
  let Topic = req.app.model.Topic;
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
  queryOptions.include = [ User, Attachment, Topic ];
  
  Trade.findAndCountAll(queryOptions).then((result) => {
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
  let Trade = req.app.model.Trade;
  let User = req.app.model.User;
  let Attachment = req.app.model.Attachment;
  let Topic = req.app.model.Topic;
  let id    = req.params.id;

  let resData = {};
  Trade.findById(id, {
    include: [ User, Attachment, Topic ]
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
    res.send(resData);
  }).catch(util.sendError);
};

exports.post = function(req, res, next) {
  let util  = new Util(req, res);  
  let resData = {};
  resData.success = false;
  resData.error = {
    message: 'Cannot add trade record'
  };
  return res.send(resData);
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);  
  let resData = {};
  resData.success = false;
  resData.error = {
    message: 'Cannot modify trade record'
  };
  return res.send(resData);
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);  
  let resData = {};
  resData.success = false;
  resData.error = {
    message: 'Cannot delete trade record'
  };
  return res.send(resData);
};