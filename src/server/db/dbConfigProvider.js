"use strict";

const path = require("path");
const env = process.env.NODE_ENV || "development";
const _ = require('lodash');
const discoverServiceAddress = require('../../utils/serviceDiscovery');

const validateConfigObject = (config) => {
  return config.username && !config.password && !config.database && !config.port && !config.host && !config.dialect
};

const mysqlStaticConfig = {
  freezeTableName: true,
  timestamps: true
};

/**
 * Function return a Promise that is resolved with an object with the next structure:
 * {
 *    username: <value>,
 *    password: <value>,
 *    database: <value>,
 *    port: <value>,
 *    host: <value>,
 *    dialect: <value>,
 *  }
 *
 *  or rejects with an error in case some of the values doesn't exist
 *
 *  The connector implements the next flow
 *  - first we are trying to get config from the db.config.json[env]
 *  - if it is empty we try to get properties from env variables
 *     --MYSQL_USER,
 *     --MYSQL_PASSWORD,
 *     --MYSQL_DATABASE,
 *     --MYSQL_PORT,
 *     --MYSQL_HOST,
 *     --MYSQL_DIALECT
 *
 *   -if host and port values are not provided we try to obtain them from consul storage
 *   -if CONSUL_HOST & MYSQL_SERVICE_NAME env variables are not defined default values will be taken
 *
 */
function getMysqlConfig() {
  let config = {};
  try {
    //getting data from db.config.json file
    config = require(path.normalize('../../../db.config.json'))[env];
    if (!validateConfigObject(config)) {
      throw new Error("No db setting corresponding environment: " + env);
    } else {
      return Promise.resolve(_.extend(config, mysqlStaticConfig));
    }
  } catch (err) {
    console.log("Can't obtain db config from 'db.config.json', trying environment variables...");
    //trying to get data  from env variables data from db.config.json file
    config = {
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
      host: process.env.MYSQL_HOST,
      dialect: process.env.MYSQL_DIALECT
    };

    if (!validateConfigObject(config)) {
      console.log('Failed to get all required db config params fro env variables, starting service discovery...');
      return discoverServiceAddress(process.env.MYSQL_SERVICE_NAME || 'mysql').then((result) => {
        return Promise.resolve(_.extend(
          config,
          {
            host: result.ServiceAddress,
            port: result.ServicePort
          },
          mysqlStaticConfig
        ))
      });
    } else {
      return Promise.resolve(_.extend(config, mysqlStaticConfig));
    }
  }
}

module.exports = getMysqlConfig;
