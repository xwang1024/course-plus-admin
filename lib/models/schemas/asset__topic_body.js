'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  assetId: {
    type: Sequelize.INTEGER
  },
  topicBodyId: {
    type: Sequelize.INTEGER
  }
}

let options = {
  freezeTableName: true,
  tableName: 't_asset__topic_body'
}

module.exports = function(sequelize) {
  return sequelize.define('assetToTopicBody', schemas, options);
}