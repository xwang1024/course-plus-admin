'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 类型 
  type: {
    type: Sequelize.ENUM('HTML', 'MARKDOWN'),
    allowNull: false
  },
  // 内容
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_topic_body'
}

module.exports = function(sequelize) {
  return sequelize.define('topic_body', schemas, options);
}