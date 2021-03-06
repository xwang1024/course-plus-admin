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
  // 后缀名
  ext: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // 存储key
  key: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_asset',
  paranoid: true,
  indexes: [{
    fields: ['type']
  },{
    fields: ['key']
  }]
}

module.exports = function(sequelize) {
  return sequelize.define('asset', schemas, options);
}