"use strict";

const models = require('./models');
const _ = require('lodash');

module.exports = function(db) {
  _.each(models, (modelInitFunction) => {
    let model = modelInitFunction(db.sequelize, db.Sequelize);
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
  // db.sequelize.sync();
  return Promise.resolve(db);
};
