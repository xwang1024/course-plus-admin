'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'name', 'type', 'ext', 'key', 'createdAt', 'updatedAt']);
}

exports.get = function(req, res, next) {
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
  let util   = new Util(req, res);
  let Asset  = req.app.model.Asset;
  let query  = req.query;

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
  
  Asset.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }

    resData.result = result.rows.map((row) => {
      var plainData = row.dataValues;
      var thumbnailUrl = `http://${config.qiniu.domain}/${row.key}?imageView2/1/w/64/h/64/format/jpg/q/80`;
      var url = `http://${config.qiniu.domain}/${row.key}`;
      var policy = new qiniu.rs.GetPolicy();
      plainData.thumbnailUrl = policy.makeRequest(thumbnailUrl);
      plainData.url = policy.makeRequest(url);
      return plainData;
    });
    res.send(resData);
  }).catch(util.sendError);
};

exports.getById = function(req, res, next) {
  let util  = new Util(req, res);
  let Asset = req.app.model.Asset;
  let id    = req.params.id;

  let resData = {};
  Asset.findById(id).then((result) => {
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
  let Asset = req.app.model.Asset;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('name', Validator.isString())
                .withRequired('type', Validator.isString({ regex: /^(IMAGE)|(AUDIO)$/ }))
                .withRequired('ext', Validator.isString())
                .withRequired('key', Validator.isString());
  // 验证body
  body = _.pick(body, ['name', 'type', 'ext', 'key']);
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
    // 查询key的唯一性
    Asset.count({ where: {key: body.key} }).then((keyExisted) => {
      if(keyExisted) {
        resData.success = false;
        resData.error = {
          message: `Key "${body.key}" has existed.`
        };
        return res.send(resData);
      }
      Asset.create(body).then((result) => {
        resData.success = true;
        resData.result = washResult(result);
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Asset = req.app.model.Asset;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('name', Validator.isString())
                .withOptional('type', Validator.isString({ regex: /^(IMAGE)|(AUDIO)$/ }))
                .withOptional('ext', Validator.isString())
                .withOptional('key', Validator.isString());
  // 验证body
  body = _.pick(body, ['name', 'type', 'ext', 'key']);
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
    Asset.findById(id).then((workingAsset) => {
      if(!workingAsset) {
        resData.success = false;
        resData.error = {
          message: `Asset "${id}" has not existed.`
        };
        return res.send(resData);
      }
      workingAsset.update(body).then(function(result) {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);
  let Asset = req.app.model.Asset;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Asset.findById(id).then((workingAsset) => {
    if(!workingAsset) {
      resData.success = false;
      resData.error = {
        message: `Asset "${id}" has not existed.`
      };
      return res.send(resData);
    }
    workingAsset.destroy().then((result) => {
      resData.success = true;
      resData.result = washResult(result)
      return res.send(resData);
    }).catch(util.sendError);
  });
};