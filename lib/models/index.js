'use strict';

var Sequelize  = require('sequelize');
var async      = require('async');

module.exports = function (app, sequelize) {
  app.models = {};

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

  app.models['Admin'] = Admin;
  app.models['Asset'] = Asset;
  app.models['AssetTopicBody'] = AssetTopicBody;
  app.models['Attachment'] = Attachment;
  app.models['Author'] = Author;
  app.models['Comment'] = Comment;
  app.models['Course'] = Course;
  app.models['School'] = School;
  app.models['Speciality'] = Speciality;
  app.models['Topic'] = Topic;
  app.models['TopicBody'] = TopicBody;
  app.models['User'] = User;

  // 建立关系
  Course.hasMany(Attachment);
  Course.hasMany(Topic);
  Speciality.hasMany(Course);
  School.hasMany(Speciality);
  Author.hasMany(Topic);
  Topic.hasOne(TopicBody);
  Asset.belongsToMany(TopicBody, {
    through: {
      model: AssetTopicBody,
      unique: true
    },
    foreignKey: 'assetId'
  });
  Topic.hasMany(Comment);
  Comment.belongsTo(User);
  Comment.hasMany(Comment, {
    foreignKey: 'parentId',
  });
  Comment.hasMany(Comment, {
    foreignKey: 'rootId',
  });
  

  // 建表
  var reset = app.config.mysql.reset;
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  var createOrder = ['School', 'Speciality', 'Author', 'Course', 'Attachment', 'Topic', 'TopicBody', 'Asset', 'AssetTopicBody', 'User', 'Comment', 'Admin'];

  if(reset) {
    dropTable(syncTable);
  } else {
    syncTable();
  }

  function dropTable(next) {
    async.eachSeries(createOrder.slice(0).reverse(), function(modelName, callback) {
      app.models[modelName].drop({ cascade: true }).then(function() { 
        callback();
      }, callback);
    }, function(err, result) {
      if(err) return console.log(err);
      next();
    });
  }

  function syncTable() {
    async.eachSeries(createOrder, function(modelName, callback) {
      app.models[modelName].sync({ force: reset }).then(function() { 
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
            console.log('[models] Root user created!');
          });
        });
      }
    });
  }
}