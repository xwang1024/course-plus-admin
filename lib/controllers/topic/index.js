'use strict';

const _         = require('lodash');
const Validator = require('node-validator');
const async     = require('async');
const Util      = require('../util');

function washResult(result) {
  return _.pick(result, ['id', 'name', 'authorId', 'author', 'courseId', 'course', 'topicBody', 'createdAt', 'updatedAt']);
}
exports.washResult = washResult;

exports.get = function(req, res, next) {
  let util  = new Util(req, res);
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
  
  Topic.findAndCountAll(queryOptions).then((result) => {
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
    res.send(resData);
  }).catch(util.sendError);
};

exports.post = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let TopicBody = req.app.model.TopicBody;
  let AssetTopicBody = req.app.model.AssetTopicBody;
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withRequired('name', Validator.isString())
                .withRequired('authorId', Validator.isNumber())
                .withRequired('courseId', Validator.isNumber())
                .withRequired('topicBody', Validator.isObject()
                                                    .withRequired('type', Validator.isString({ regex: /^(HTML)|(MARKDOWN)$/ }))
                                                    .withRequired('content', Validator.isString())
                             );

  // 验证body
  body = _.pick(body, ['name', 'authorId', 'courseId', 'topicBody']);
  body.topicBody = _.pick(body.topicBody, ['type', 'content']);
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
    Topic.create(body, {
      include: [{
        model: TopicBody,
        as: 'topicBody'
      }]
    }).then((result) => {
      // 重新建立文章和素材的映射关系
      rebuildRelation(AssetTopicBody, result.topicBody.id, result.topicBody.content, function() {
        resData.success = true;
        resData.result = washResult(result);
        return res.send(resData);
      }, util.sendError)
    }).catch(util.sendError);
  });
};

exports.put = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let TopicBody = req.app.model.TopicBody;
  let AssetTopicBody = req.app.model.AssetTopicBody;
  let id    = parseInt(req.params.id);
  let body  = req.body;
  
  let resData = {};
  let check = Validator
                .isObject()
                .withOptional('name', Validator.isString())
                .withOptional('authorId', Validator.isNumber())
                .withOptional('courseId', Validator.isNumber())
                .withOptional('topicBody', Validator.isObject()
                                                    .withOptional('type', Validator.isString({ regex: /^(HTML)|(MARKDOWN)$/ }))
                                                    .withOptional('content', Validator.isString())
                             );
  // 验证body
  body = _.pick(body, ['name', 'authorId', 'courseId', 'topicBody']);
  body.topicBody = _.pick(body.topicBody, ['type', 'content']);
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
    Topic.findById(id, {
      include: [{
        model: TopicBody,
        as: 'topicBody'
      }]
    }).then((workingTopic) => {
      if(!workingTopic) {
        resData.success = false;
        resData.error = {
          message: `Topic "${id}" has not existed.`
        };
        return res.send(resData);
      }
      var topicBodyId = workingTopic.topicBody.id;
      workingTopic.topicBody.update(body.topicBody).then(function(subResult) {
        workingTopic.update(body).then(function(result) {
          // 重新建立文章和素材的映射关系
          rebuildRelation(AssetTopicBody, topicBodyId, result.topicBody.content, function() {
            resData.success = true;
            resData.result = washResult(result);
            return res.send(resData);
          }, util.sendError);
        }).catch(util.sendError);
      }).catch(util.sendError);
    }).catch(util.sendError);
  });
};

exports.delete = function(req, res, next) {
  let util  = new Util(req, res);
  let Topic = req.app.model.Topic;
  let TopicBody = req.app.model.TopicBody;
  let AssetTopicBody = req.app.model.AssetTopicBody;
  let id    = parseInt(req.params.id);

  let resData = {};
  // 检查id是否存在
  Topic.findById(id, {
      include: [{
        model: TopicBody,
        as: 'topicBody'
      }]
    }).then((workingTopic) => {
    if(!workingTopic) {
      resData.success = false;
      resData.error = {
        message: `Topic "${id}" has not existed.`
      };
      return res.send(resData);
    }
    if(workingTopic.topicBody) {
      workingTopic.topicBody.destroy().then((subResult) => {
        workingTopic.destroy().then((result) => {
          // 重新建立文章和素材的映射关系
          rebuildRelation(AssetTopicBody, 0, "", function() {
            resData.success = true;
            resData.result = washResult(result);
            return res.send(resData);
          }, util.sendError);
        }).catch(util.sendError);
      }).catch(util.sendError);
    } else {
      workingTopic.destroy().then((result) => {
        resData.success = true;
        resData.result = washResult(result)
        return res.send(resData);
      }).catch(util.sendError);
    }
    
    
  });
};

function rebuildRelation(AssetTopicBody, topicBodyId, content, next, processError) {
  AssetTopicBody.destroy({where: {topicBodyId: topicBodyId}}).then(function(results) {
    // 解析content
    let assetIdArr = getAssetIdArrayFromHtml(content);
    async.each(assetIdArr, function(assetId, callback) {
      AssetTopicBody.create({
        assetId: parseInt(assetId),
        topicBodyId: parseInt(topicBodyId)
      }).then(function() { callback() }).catch(callback);
    }, function(err) {
      if(err) return processError(err);
      next();
    });
  }).catch(processError);
}

function getAssetIdArrayFromHtml(content) {
  let regexp = /asset\-id="([\w]+)"/g;
  let result;
  let assetIdArr = [];
  do {
    result = regexp.exec(content);
    if (result && result[1] && result[1].length > 0) assetIdArr.push(result[1]);
  } while (result != null);
  return assetIdArr;
}