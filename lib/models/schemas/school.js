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
  }
}

let options = {
  paranoid: true,
  freezeTableName: true,
  tableName: 't_school'
}

module.exports = function(sequelize) {
  return sequelize.define('school', schemas, options);
}