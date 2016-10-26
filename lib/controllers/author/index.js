'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'name', 'icon', 'avatar', 'phone', 'email', 
                         'qq', 'wechat', 'introduction', 'attachment', 'contactCost', 
                         'createdAt', 'updatedAt', 'iconThumbnailUrl', 'iconUrl', 'avatarUrl']);
}

exports.washResult = washResult;

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let config = req.app.config;
  let qiniu  = req.app.qiniu;
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
    resData.result = result.rows.map((row) => {
      var plainData = row.dataValues;
      var iconThumbnailUrl = `http://${config.qiniu.domain}/${row.icon}?imageView2/1/w/64/h/64/format/jpg/q/100`;
      var iconUrl = `http://${config.qiniu.domain}/${row.icon}`;
      var avatarUrl = `http://${config.qiniu.domain}/${row.avatar}`;
      var policy = new qiniu.rs.GetPolicy();
      plainData.iconThumbnailUrl = policy.makeRequest(iconThumbnailUrl);
      plainData.iconUrl = policy.makeRequest(iconUrl);
      plainData.avatarUrl = policy.makeRequest(avatarUrl);
      if(row.attachment) {
        var attachmentUrl = `http://${config.qiniu.domain}/${row.attachment.key}`;
        plainData.attachment.url = policy.makeRequest(attachmentUrl);
      }
      return plainData;
    });
    res.send(resData);
  }).catch(util.sendError);
};

exports.getById = function(req, res, next) {
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
    res.send(resData);
  }).catch(util.sendError);
};

exports.post = function(req, res, next) {
  let util  = new Util(req, res);
  let Author = req.app.model.Author;
  let Attachment = req.app.model.Attachment;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('name', Validator.isString())
                .withOptional('icon', Validator.isString())
                .withOptional('avatar', Validator.isString())
                .withOptional('phone', Validator.isString())
                .withOptional('email', Validator.isString())
                .withOptional('qq', Validator.isString())
                .withOptional('wechat', Validator.isString())
                .withOptional('introduction', Validator.isString())
                .withOptional('attachment', Validator.isObject()
                                                     .withRequired('name', Validator.isString())
                                                     .withRequired('key', Validator.isString())
                                                     .withRequired('ext', Validator.isString())
                                                     .withRequired('cost', Validator.isNumber({min: 0, max: 1000000}))
                             )
                .withOptional('contactCost', Validator.isNumber());
  // 验证body
  body = _.pick(body, ['name', 'icon', 'avatar', 'phone', 'email', 'qq', 'wechat', 'introduction', 'attachment', 'contactCost']);
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
    if(body.attachment) {
      Author.create(body, {
        include: [ Attachment ]
      }).then((result) => {
        resData.success = true;
        resData.result = washResult(result);
        return res.send(resData);
      }).catch(util.sendError);
    } else {

    }
    
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Author = req.app.model.Author;
  let Attachment = req.app.model.Attachment;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('name', Validator.isString())
                .withOptional('icon', Validator.isString())
                .withOptional('avatar', Validator.isString())
                .withOptional('phone', Validator.isString())
                .withOptional('email', Validator.isString())
                .withOptional('qq', Validator.isString())
                .withOptional('wechat', Validator.isString())
                .withOptional('introduction', Validator.isString())
                .withOptional('attachment', Validator.isObject()
                                                     .withOptional('name', Validator.isString())
                                                     .withOptional('key', Validator.isString())
                                                     .withOptional('ext', Validator.isString())
                                                     .withOptional('cost', Validator.isNumber({min: 0, max: 1000000}))
                             )
                .withOptional('contactCost', Validator.isNumber());

  // 验证body
  body = _.pick(body, ['name', 'icon', 'avatar', 'phone', 'email', 'qq', 'wechat', 'introduction', 'attachment', 'contactCost']);
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
    Author.findById(id, {
      include: [ Attachment ]
    }).then((workingAuthor) => {
      if(!workingAuthor) {
        resData.success = false;
        resData.error = {
          message: `Author "${id}" has not existed.`
        };
        return res.send(resData);
      }
      
      if(body.attachment) {
        workingAuthor.attachment.update(body.attachment).then(function() {
          workingAuthor.update(body).then(function(result) {
            resData.success = true;
            resData.result = washResult(result)
            return res.send(resData);
          }).catch(util.sendError);
        });
      } else {
        workingAuthor.update(body).then(function(result) {
          resData.success = true;
          resData.result = washResult(result)
          return res.send(resData);
        }).catch(util.sendError);
      }
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);
  let Author = req.app.model.Author;
  let Attachment = req.app.model.Attachment;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Author.findById(id, {
    include:[ Attachment ]
  }).then((workingAuthor) => {
    if(!workingAuthor) {
      resData.success = false;
      resData.error = {
        message: `Author "${id}" has not existed.`
      };
      return res.send(resData);
    }
    if(workingAuthor.attachment) {
      workingAuthor.attachment.destroy().then(destroyAuthor).catch(util.sendError);
    } else {
      destroyAuthor();
    }
    
    function destroyAuthor() {
      workingAuthor.destroy().then((result) => {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }
  });
};