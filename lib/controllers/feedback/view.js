'use strict';

const _         = require('lodash');
const async     = require('async');
const Validator = require('node-validator');
const Util      = require('../util');

exports.index = function(req, res, next) {
  let util  = new Util(req, res);
  let Course = req.app.model.Course;
  let Speciality = req.app.model.Speciality;
  let School = req.app.model.School;
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
    model: Speciality,
    include: [ School ]
  }]
  
  Course.findAndCountAll(queryOptions).then((result) => {
    resData.success = true;
    resData.totalCount = result.count;
    if(!query.noPagination) {
      resData.pageCount = Math.ceil(result.count/resData.pageSize);
    }

    async.map(result.rows, function(row, callback) {
      row.countTopics().then((topicCount) => {
        row.countAttachments().then((attachmentCount) => {
          callback(null, {topicCount: topicCount, attachmentCount: attachmentCount});
        }).catch(callback);
      }).catch(callback);
    }, function(err, countArr) {
      console.log(countArr);
      resData.result = result.rows.map((row, index) => {
        var plainData = _.assign(row.dataValues, countArr[index]);
        return plainData;
      });
      util.render('course/index', '课程管理', resData);
    });
  }).catch(next);
};

exports.detail = function(req, res, next) {

};

exports.create = function(req, res, next) {

};

exports.modify = function(req, res, next) {

};