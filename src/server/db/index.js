"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const models = require('./models');
const _ = require('lodash');

let config = {};

try {
    config = require(path.normalize('../../../db.config.json'))[env];
} catch (err) {
    throw new Error("DB configuration file " + configPath + " is not found or can't be read." +
        " Use db.config.json.sample file as a boilerplate for your own config.");
}

config = _.extend(config, {
    freezeTableName: true,
    timestamps: true
});

console.log("--------\nDB configuration\n", config, "\n-----------\n");

let sequelize = new Sequelize(config.database, config.username, config.password, config);

let db = {};
//defining constant, immutable data in exported databse info
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

