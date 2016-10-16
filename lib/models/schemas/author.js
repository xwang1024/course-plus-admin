'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 姓名
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 头像
  icon: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 电话
  phone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // email
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // qq
  qq: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // wechat
  wechat: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 介绍
  introduction: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_author'
}

module.exports = function(sequelize) {
  return sequelize.define('author', schemas, options);
}