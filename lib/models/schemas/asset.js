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
  // 类型
  type: {
    type: Sequelize.ENUM('IMAGE', 'AUDIO'),
    allowNull: false
  },
  // 存储key
  key: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

let options = {
  indexes: [{
    fields: ['type']
  }]
}

module.exports = function(sequelize) {
  return sequelize.define('asset', schemas, options);
}