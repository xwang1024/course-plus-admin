'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

let washResult = require('./index').washResult;

exports.index = function(req, res, next) {
  let util  = new Util(req, res);
  let Author = req.app.model.Author;
  let Attachment = req.app.model.Attachment;
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
  queryOptions.include = [ Attachment ];
  
  Author.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }
    resData.result = result.rows;
    util.render('author/index', '作者管理', resData);
  }).catch(next);
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
  let util   = new Util(req, res);
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
  let Author = req.app.model.Author;
  let Attachment = req.app.model.Attachment;
  let id     = req.params.id;

  let resData = {};
  Author.findById(id, {
    include: [ Attachment ]
  }).then((result) => {
    if(result) {
      resData.success = true;
      var plainData = result.dataValues;
      var iconThumbnailUrl = `http://${config.qiniu.domain}/${result.icon}?imageView2/1/w/64/h/64/format/jpg/q/100`;
      var iconUrl = `http://${config.qiniu.domain}/${result.icon}`;
      var avatarUrl = `http://${config.qiniu.domain}/${result.avatar}`;
      var policy = new qiniu.rs.GetPolicy();
      plainData.iconThumbnailUrl = policy.makeRequest(iconThumbnailUrl);
      plainData.iconUrl = policy.makeRequest(iconUrl);
      plainData.avatarUrl = policy.makeRequest(avatarUrl);
      if(result.attachment) {
        var attachmentUrl = `http://${config.qiniu.domain}/${result.attachment.key}`;
        plainData.attachment.url = policy.makeRequest(attachmentUrl);
      }
      resData.result = washResult(plainData)
    } else {
      resData.success = false;
      resData.error = {
        message: 'Cannot find this id'
      };
    }
    util.render('author/modify', '修改作者', resData);
  }).catch(next);
};