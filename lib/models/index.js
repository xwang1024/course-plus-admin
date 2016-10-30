'use strict';

var Sequelize  = require('sequelize');
var async      = require('async');

module.exports = function (app, sequelize) {
  app.model = {};

  var Admin = require('./schemas/admin')(sequelize);
  var Asset = require('./schemas/asset')(sequelize);
  var AssetTopicBody = require('./schemas/asset__topic_body')(sequelize);
  var Attachment = require('./schemas/attachment')(sequelize);
  var Author = require('./schemas/author')(sequelize);
  var Comment = require('./schemas/comment')(sequelize);
  var Course = require('./schemas/course')(sequelize);
  var School = require('./schemas/school')(sequelize);
  var Speciality = require('./schemas/speciality')(sequelize);
  var Topic = require('./schemas/topic')(sequelize);
  var TopicBody = require('./schemas/topic_body')(sequelize);
  var User = require('./schemas/user')(sequelize);
  var Trade = require('./schemas/trade')(sequelize);
  var Question = require('./schemas/question')(sequelize);
  var Feedback = require('./schemas/feedback')(sequelize);

  app.model['Admin'] = Admin;
  app.model['Asset'] = Asset;
  app.model['AssetTopicBody'] = AssetTopicBody;
  app.model['Attachment'] = Attachment;
  app.model['Author'] = Author;
  app.model['Comment'] = Comment;
  app.model['Course'] = Course;
  app.model['School'] = School;
  app.model['Speciality'] = Speciality;
  app.model['Topic'] = Topic;
  app.model['TopicBody'] = TopicBody;
  app.model['User'] = User;
  app.model['Trade'] = Trade;
  app.model['Question'] = Question;
  app.model['Feedback'] = Feedback;

  // 建立关系
  Course.hasMany(Attachment);
  Attachment.belongsTo(Course);

  Author.hasOne(Attachment);
  Attachment.belongsTo(Author);

  Course.hasMany(Topic);
  Topic.belongsTo(Course);

  Speciality.hasMany(Course);
  Course.belongsTo(Speciality);

  School.hasMany(Speciality);
  Speciality.belongsTo(School);

  Author.hasMany(Topic);
  Topic.belongsTo(Author);

  Topic.hasOne(TopicBody);
  TopicBody.belongsTo(Topic);

  Asset.belongsToMany(TopicBody, {
    through: {
      model: AssetTopicBody
    },
    foreignKey: 'assetId'
  });
  TopicBody.belongsToMany(Asset, {
    through: {
      model: AssetTopicBody
    },
    foreignKey: 'topicBodyId'
  });

  User.hasMany(Trade);
  Trade.belongsTo(User);
  Attachment.hasMany(Trade);
  Trade.belongsTo(Attachment);
  Topic.hasMany(Trade);
  Trade.belongsTo(Topic);

  Topic.hasMany(Comment);
  User.hasMany(Comment);
  Comment.belongsTo(User);
  Comment.hasMany(Comment, {
    foreignKey: 'parentId',
  });
  Comment.hasMany(Comment, {
    foreignKey: 'rootId',
  });

  User.hasMany(Question);
  Question.belongsTo(User);
  Topic.hasMany(Question);
  Question.belongsTo(Topic);

  User.hasMany(Feedback);
  Feedback.belongsTo(User);
  Trade.hasMany(Feedback);
  Feedback.belongsTo(Trade);

  // 建表
  var reset = app.config.mysql.reset;
  var createOrder = ['School', 'Speciality', 'Author', 'Course', 'Attachment', 'Topic',
                     'TopicBody', 'Asset', 'AssetTopicBody', 'User', 'Trade' ,'Comment', 'Admin',
                     'Question', 'Feedback'];

  if(reset) {
    dropTable(syncTable);
  } else {
    syncTable();
  }

  function dropTable(next) {
    async.eachSeries(createOrder.slice(0).reverse(), function(modelName, callback) {
      app.model[modelName].drop({ cascade: true }).then(function() { 
        callback();
      }, callback);
    }, function(err, result) {
      if(err) return console.log(err);
      next();
    });
  }

  function syncTable() {
    async.eachSeries(createOrder, function(modelName, callback) {
      app.model[modelName].sync({ force: reset }).then(function() { 
        callback();
      }, callback);
    }, function(err, result) {
      if(err) return console.log(err);
      if(app.config.mysql.reset) {
        // 创建root用户
        Admin.encryptPassword('root', (err, hash) => {
          if (err) return console.log('Error on Create Root User!', err);
          var rootAdmin = {
            username: 'root',
            nickname: '管理员',
            role:     'SU',
            password: hash,
            enable:   true
          };
          return Admin.create(rootAdmin).then(function() {
            console.log('[model] Root user created!');
          });
        });
      }
    });
  }
}

