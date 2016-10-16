'use strict';

var Sequelize  = require('sequelize');
var bcrypt     = require('bcryptjs');
var _          = require('lodash');

let schemas = {
  id: {
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
    type: Sequelize.STRING,
    allowNull: false
  },
  // 昵称
  nickname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 头像
  icon: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // 电话
  phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // email
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // qq
  qq: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // 微信号
  wechat: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // 介绍
  introduction: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  // 是否可用
  enable: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_user',
  indexes: [{
    unique: true,
    fields: ['username', 'phone', 'email']
  }]
}

module.exports = function(sequelize) {
  return sequelize.define('user', schemas, options);
}