'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 意见正文
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  // 是否被解决
  isSolved: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // 处理方式备注
  remark: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_feedback'
}

module.exports = function(sequelize) {
  return sequelize.define('feedback', schemas, options);
}