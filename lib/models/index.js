'use strict';

var Sequelize  = require('sequelize');

module.exports = function (app, sequelize) {
  app.models = {};
  var Admin = require('./schemas/admin')(sequelize);

  app.models['Admin'] = Admin;

  // 建表
  for(let modelName in app.models) {
    var execution = app.models[modelName].sync({ force: app.config.mysql.reset });
    if(modelName === 'Admin' && app.config.mysql.reset) {
      // 创建root用户
      execution.then(() => {
        app.models.Admin.encryptPassword('root', (err, hash) => {
          if (err) return console.log('Error on Create Root User!', err);
          var rootAdmin = {
            username: 'root',
            nickname: 'root',
            role:     'su',
            password: hash,
            enable:   true
          };
          return Admin.create(rootAdmin);
        });
        
      });
    }
  }
}