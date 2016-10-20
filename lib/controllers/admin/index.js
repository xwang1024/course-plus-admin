'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'username', 'nickname', 'enable', 'role', 'createdAt', 'updatedAt']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let Admin = req.app.model.Admin;
  let query = req.query;

  let queryOptions = {};
  let resData = {};
  // 需要获取那些字段
  queryOptions.attributes = {};
  queryOptions.attributes.exclude = ['password', 'deletedAt'];
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
  
  Admin.findAndCountAll(queryOptions).then((result) => {
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
  let Admin = req.app.model.Admin;
  let id    = req.params.id;

  let resData = {};
  Admin.findById(id).then((result) => {
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
  let Admin = req.app.model.Admin;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('username', Validator.isString({ regex: /^[a-z][a-z1-9]{3,19}$/ }))
                .withRequired('password', Validator.isString({ regex: /^.{6,20}$/ }))
                .withRequired('nickname', Validator.isString({ regex: /^.+$/ }))
                .withOptional('enable', Validator.isBoolean())
                .withRequired('role', Validator.isString({ regex: /^(SU)|(OP)$/ }));
  // 验证body
  body = _.pick(body, ['username', 'password', 'nickname', 'enable', 'role']);
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
    // 查询username的唯一性
    Admin.count({ where: {username: body.username} }).then((usernameExisted) => {
      if(usernameExisted) {
        resData.success = false;
        resData.error = {
          message: `Username "${body.username}" has existed.`
        };
        return res.send(resData);
      }
      // 密码加密
      Admin.encryptPassword(body.password, function(err, hash) {
        if(err) return util.sendError(err);
        body.password = hash;
        // 保存
        Admin.create(body).then((result) => {
          resData.success = true;
          resData.result = washResult(result);
          return res.send(resData);
        }).catch(util.sendError);
      });
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Admin = req.app.model.Admin;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('password', Validator.isString({ regex: /^.{6,20}$/ }))
                .withOptional('nickname', Validator.isString({ regex: /^.+$/ }))
                .withOptional('enable', Validator.isBoolean())
                .withOptional('role', Validator.isString({ regex: /^(SU)|(OP)$/ }));
  // 验证body
  body = _.pick(body, ['password', 'nickname', 'enable', 'role']);
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
    Admin.findById(id).then((workingAdmin) => {
      if(!workingAdmin) {
        resData.success = false;
        resData.error = {
          message: `Admin "${id}" has not existed.`
        };
        return res.send(resData);
      }
      // 密码加密
      if(body.password) {
        Admin.encryptPassword(body.password, function(err, hash) {
          if(err) return util.sendError(err);
          body.password = hash;
          updateData();
        });
      } else {
        updateData();
      }

      // 更新
      function updateData() {
        workingAdmin.update(body).then(function(result) {
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
  let Admin = req.app.model.Admin;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Admin.findById(id).then((workingAdmin) => {
    if(!workingAdmin) {
      resData.success = false;
      resData.error = {
        message: `Admin "${id}" has not existed.`
      };
      return res.send(resData);
    }
    workingAdmin.destroy().then((result) => {
      resData.success = true;
      resData.result = washResult(result)
      return res.send(resData);
    }).catch(util.sendError);
  });
};