'use strict';

var Sequelize  = require('sequelize');
var _          = require('lodash');

let schemas = {
  assetId: {
    type: Sequelize.INTEGER
  }
}

let options = {
}

module.exports = function(sequelize) {
  return sequelize.define('asset_topic_body', schemas, options);
}