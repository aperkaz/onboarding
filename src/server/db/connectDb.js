"use strict";

const Sequelize = require("sequelize");
const Promise = require('bluebird');

module.exports = function(config) {
  console.log("--------\nDB configuration\n", config, "\n-----------\n");
  let sequelize = new Sequelize(config.database, config.username, config.password, config);

  let db = {};
  // defining constant, immutable data in exported returned info
  Object.defineProperties(db, {
    config: {
      value: config,
      writable: false,
      configurable: false,
      enumerable: true
    },
    sequelize: {
      value: sequelize,
      writable: false,
      configurable: false,
      enumerable: true
    },
    Sequelize: {
      value: Sequelize,
      writable: false,
      configurable: false,
      enumerable: true
    }
  });

  return Promise.resolve(db);
};
