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
  // 后缀名
  ext: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 存储key
  key: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 价格
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_attachment',
  indexes: [{
    fields: ['key']
  }]
}

module.exports = function(sequelize) {
  return sequelize.define('attachment', schemas, options);
}