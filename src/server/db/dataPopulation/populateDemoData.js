const _ = require('lodash');
const demodata = require('./demodata');
const sortPopulationConfigs = require('./sortPopulationConfigs');
const Promise = require('bluebird');
const POPULATE_DATA = process.env.POPULATE_DATA;

/**
 * Executes data population, that is defined in demodata folder,
 * all items from each files are populated 1 after another
 * files are populated according to sortPopulationConfigs rules
 * TODO: maybe items from each single files could be populated in parrallel
 *
 * @param db - database config instance
 * @return Promise that is responsible for all data popolation
 */
function populateDemodata(db) {
  if (POPULATE_DATA !== 'true') {
    return Promise.resolve(
      console.log("Skipping data population.")
    )
  } else {
    let sortedDataPopulateConfigs = sortPopulationConfigs(demodata);

    let executionChain = Promise.resolve(
      console.log("Starting data population...")
    );

    let start = new Date().getTime();
    _.each(sortedDataPopulateConfigs, (populationConfig) => {
      _.each(populationConfig.data, (dataEntry) => {
        executionChain = executionChain.then(() => {
          return db[populationConfig.model].upsert(dataEntry);
        })
      });
    });

    return executionChain.then(() => {
      console.log(`Data finished in ${(new Date().getTime() - start) / 1000} seconds.`);
      return Promise.resolve(db);
    }).catch((err) => {
      console.error("Data population failed.");
      console.error(err);
      return Promise.resolve(db);
    });
  }
}

module.exports = populateDemodata;
