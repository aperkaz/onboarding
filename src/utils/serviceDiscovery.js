"use strict"
const _ = require('lodash');
const CONSUL_HOST = process.env.CONSUL_HOST || 'consul';
const MYSQL_SERVICE_NAME = process.env.MYSQL_SERVICE_NAME || 'mysql';

const consul = require(CONSUL_HOST)({
  promisify: true,
  host: 'consul'
});

const mysqlServiceDiscoverySuccessCallback = (serviceInfo) => {
  let serviceNode = _.head(serviceInfo);
  console.log("MySql discovery success:");
  console.log(serviceNode);
  return Promise.resolve({
    host: serviceNode.ServiceAddress,
    port: serviceNode.ServicePort
  });
};

const mysqlServiceDiscoveryErrorCallback = (callback) => {
  return (err) => {
    console.log("Failed get 'mysql' service data from 'consul', waiting 1 sec, reconnecting.");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          consul.catalog.service.nodes(MYSQL_SERVICE_NAME).then(
            mysqlServiceDiscoverySuccessCallback
          ).catch(callback)
        }, 1000
      );
    });
  };
};

/**
 * Discovers mysql host & port from consul registry
 * Required environment variables:
 * - CONSUL_HOST ('consul' by default)
 * - MYSQL_SERVICE_NAME
 */
function discoverDbHostAndPort() {
  return consul.catalog.service.nodes(MYSQL_SERVICE_NAME).then(mysqlServiceDiscoverySuccessCallback).catch(
    mysqlServiceDiscoveryErrorCallback(
      mysqlServiceDiscoveryErrorCallback(
        mysqlServiceDiscoveryErrorCallback((err) => {
          console.error("Cant get db info from consul");
          process.exit(1);
        })
      )
    )
  )
}

module.exports = discoverDbHostAndPort;
