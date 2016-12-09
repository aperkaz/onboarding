"use strict";

const Sequelize = require("sequelize");
const models = require('./models');
const _ = require('lodash');
const getMysqlConfig = require('./dbConfigProvider');

/**
 * Returns Promise that is resolved with db object that consists of
 * {
 *  config: <db config>,
 *  sequelize: <sequalize instance>
 *  <models>
 * }
 */
function connectDatabase() {
  return getMysqlConfig().then((config) => {
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
      }
    });

    _.each(models, (modelInitFunction) => {
      let model = modelInitFunction(sequelize, Sequelize);
      Object.defineProperty(db, model.name, {
        value: model,
        writable: false,
        configurable: false,
        enumerable: true
      });
    });
    Object.keys(db).forEach(function(modelName) {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    sequelize.sync();

    return Promise.resolve(db);

  }).catch((err) => {
    throw new Error("Cat get database config setting.");
  });
}

module.exports = connectDatabase;
