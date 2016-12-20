"use strict";

const getMysqlConfig = require('./dbConfigProvider');
const registerModels = require('./registerModels');
const populateDemodata = require('./dataPopulation/populateDemoData');
const connectDb = require('./connectDb');
const migrateDb = require('./migrateDb');

/**
 * Implements flow that should be executed with database to be up'n'running
 * 1) get db credentianls from db.config.js/env/consul
 * 2) execute migrations
 * 3) register models
 * 4) populate demodata (if env.POPULATE_DATA == true)
 *
 * Returns Promise that is resolved with db object that consists of
 * {
 *  config: <db config>,
 *  sequelize: <sequalize instance>
 *  <models>
 * }
 */
module.exports = function() {
  return getMysqlConfig().then(
    connectDb
  ).then(
    migrateDb
  ).then(
    registerModels
  ).then(
    populateDemodata
  )
};
