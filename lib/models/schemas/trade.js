'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  attachmentId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_trade'
}

module.exports = function(sequelize) {
  return sequelize.define('trade', schemas, options);
}