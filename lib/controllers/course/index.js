'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'name', 'introduction', 'cover', 'createdAt', 'updatedAt', 'specialityId', 'speciality', 'coverUrl']);
}

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
  let Course = req.app.model.Course;
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
  
  Course.findAndCountAll(queryOptions).then((result) => {
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
  let Course = req.app.model.Course;
  let Speciality = req.app.model.Speciality;
  let School = req.app.model.School;
  let id    = req.params.id;

  let resData = {};
  Course.findById(id, {
    include: [{
      model: Speciality,
      include: [ School ]
    }]
  }).then((result) => {
    if(result) {
      var plainData = result.dataValues;
      var coverUrl = `http://${config.qiniu.domain}/${plainData.cover}`;
      var policy = new qiniu.rs.GetPolicy();
      plainData.coverUrl = policy.makeRequest(coverUrl);
      
      resData.success = true;
      resData.result = washResult(plainData);
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
  let Course = req.app.model.Course;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('name', Validator.isString())
                .withRequired('cover', Validator.isString())
                .withRequired('introduction', Validator.isString())
                .withRequired('specialityId', Validator.isNumber());
  // 验证body
  body = _.pick(body, ['name', 'cover', 'introduction', 'specialityId']);
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
    Course.create(body).then((result) => {
      resData.success = true;
      resData.result = washResult(result);
      return res.send(resData);
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Course = req.app.model.Course;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('name', Validator.isString())
                .withOptional('cover', Validator.isString())
                .withOptional('introduction', Validator.isString())
                .withOptional('specialityId', Validator.isNumber());
  // 验证body
  body = _.pick(body, ['name', 'cover','introduction', 'specialityId']);
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
    Course.findById(id).then((workingCourse) => {
      if(!workingCourse) {
        resData.success = false;
        resData.error = {
          message: `Course "${id}" has not existed.`
        };
        return res.send(resData);
      }
      workingCourse.update(body).then(function(result) {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);
  let Course = req.app.model.Course;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Course.findById(id).then((workingCourse) => {
    if(!workingCourse) {
      resData.success = false;
      resData.error = {
        message: `Course "${id}" has not existed.`
      };
      return res.send(resData);
    }
    workingCourse.destroy().then((result) => {
      resData.success = true;
      resData.result = washResult(result)
      return res.send(resData);
    }).catch(util.sendError);
  });
};