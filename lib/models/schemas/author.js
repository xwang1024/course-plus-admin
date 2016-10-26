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
  // 头像链接
  icon: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // 照片链接
  avatar: {
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
  // 联系作者费用
  contactCost: {
    type: Sequelize.INTEGER,
    allowNull: false,
    default: 0
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_author'
}

module.exports = function(sequelize) {
  return sequelize.define('author', schemas, options);
}