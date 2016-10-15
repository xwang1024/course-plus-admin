'use strict';

var Sequelize  = require('sequelize');
var bcrypt     = require('bcryptjs');
var _          = require('lodash');

let schemas = {
  uid: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 用户名
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 密码
  password: {
    type: Sequelize.STRING(256),
    allowNull: false
  },
  // 昵称
  nickname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 是否可用
  enable: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // 角色: SU-管理员, OP-运营
  role: {
    type: Sequelize.ENUM('SU', 'OP'),
    allowNull: false,
    defaultValue: 'SU'
  }
}

let options = {
  indexes: [{
    unique: true,
    fields: ['username']
  }],
  classMethods: {
    // 密码加密
    encryptPassword: function(password, callback) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) return callback(err);
        bcrypt.hash(password, salt, function(err, hash) {
          callback(err, hash);
        });
      });
    },
    // 密码比较
    validatePassword: function(password, hash, callback) {
      bcrypt.compare(password, hash, function(err, res) {
        callback(err, res);
      });
    },
  },
  instanceMethods: {
    canPlayRoleOf: function(role) {
      return (role === this.role);
    },
    defaultReturnUrl: function() {
      var returnUrl = '/admin/dashboard';
      return returnUrl;
    },
    getVO: function() {
      return _.pick(this, ['id', 'username', 'role', 'enable']);
    }
  }
}

module.exports = function(sequelize) {
  return sequelize.define('admin', schemas, options);
}