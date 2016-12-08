"use strict";

const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const models = require('./models');
const _ = require('lodash');

let config = {};

try {
  config = require(path.normalize('../../../db.config.json'))[env];
} catch (err) {
  console.log("--------\n db.config.json wasn't found," +
  " trying to get db config setting from environment variables\n-----------\n");

    config = {
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
      host: process.env.MYSQL_HOST,
      dialect: process.env.MYSQL_DIALECT
    };
    if(
      !config.username ||
      !config.password ||
      !config.database ||
      !config.port ||
      !config.host ||
      !config.dialect
    ) {
      throw new Error("DB configuration wasn't provided!\n" +
        "Use db.config.json.sample file or environment variables to set up db connection.");
    }
}

config = _.extend(config, {
  freezeTableName: true,
  timestamps: true
});

console.log("--------\nDB configuration\n", config, "\n-----------\n");

let sequelize = new Sequelize(config.database, config.username, config.password, config);

let db = {};
// defining constant, immutable data in exported databse info
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

module.exports = db;
