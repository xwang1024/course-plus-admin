'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 问题正文
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  // 收信邮箱
  userEmail: {
    type: Sequelize.STRING,
    allowNull: false 
  },
  // 回复正文
  replyContent: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_question'
}

module.exports = function(sequelize) {
  return sequelize.define('question', schemas, options);
}