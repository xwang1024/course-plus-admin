'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 介绍
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_comment'
}

module.exports = function(sequelize) {
  return sequelize.define('comment', schemas, options);
}