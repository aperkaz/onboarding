"use strict";

const getMysqlConfig = require('./dbConfigProvider');
const registerModels = require('./registerModels');
const populateDemodata = require('./dataPopulation/populateDemoData');

/**
 * Returns Promise that is resolved with db object that consists of
 * {
 *  config: <db config>,
 *  sequelize: <sequalize instance>
 *  <models>
 * }
 */
function connectDatabase() {
  return getMysqlConfig().then(registerModels).then(populateDemodata);
}

module.exports = connectDatabase;
