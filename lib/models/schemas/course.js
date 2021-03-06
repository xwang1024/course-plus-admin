'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 名称
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 封面
  cover: {
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
  paranoid: true,
  freezeTableName: true,
  tableName: 't_course'
}

module.exports = function(sequelize) {
  return sequelize.define('course', schemas, options);
}