"use strict";

const Sequelize = require("sequelize");
const Promise = require('bluebird');
const retry = require('bluebird-retry');

let retries = 0;
const maxRetries = 20;
const retryTimeoutMillis = 1000;

const setupDb = (config, sequelize) => {
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

/**
 * Tries to connect to mysql server and execute simple select
 * Validates that db server is up & running.
 */
const connectAndValidate = (config) => {
  return () => {
    console.log(`Attempting mysql connect (try #${++retries})`);
    let sequelize = new Sequelize(config.database, config.username, config.password, config);
    return sequelize.query("SELECT 1").then(function(results) {
      console.log("Database connection successfully established.");
      return setupDb(config, sequelize);
    }).catch((err) => {
      console.warn("db not available, rejecting");
      return new Promise((resolve, reject) => {
        console.log("Failed to connect, possibly retrying.");
        reject(err)
      })
    })
  }
};

/**
 * Executes *connectAndValidate* until until it wont be resolved with success (or 20 times) with 1sec
 * interval.
 * This code is needed because mysql takes time after starting to be ready for working
 */
module.exports = function(config) {
  console.log("--------\nDB configuration\n", config, "\n-----------\n");

  return retry(connectAndValidate(config), {
    interval: retryTimeoutMillis,
    max_tries: maxRetries
  }).then((db) => {
    return Promise.resolve(db);
  }).catch((err) => {
    console.log("Db was not connected, shutting down");
    process.exit(1);
  })
};
