"use strict";

const _ = require('lodash');
const CONSUL_HOST = process.env.CONSUL_HOST || 'consul';
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const SERVICE_DISCOVERY_TIMEOUT = process.env.MYSQL_WAITING_TIMEOUT || 1000;
const SERVICE_DISCOVERY_RETRIES = process.env.MYSQL_RECONNECT_NUMBER || 3;

const consul = require('consul')({
  promisify: true,
  host: CONSUL_HOST
});

const getServiceInfo = (serviceName) => {
  return () => {
    return consul.catalog.service.nodes(serviceName).catch((err) => {
      return new Promise((resolve, reject) => {
        console.log(
          `Failed to get '${serviceName}' info, waiting for ${SERVICE_DISCOVERY_TIMEOUT}ms, trying to reconnect`
        );
        reject(err);
      });
    })
  }
};

const getServices = () => {
  return consul.catalog.service.list().catch((err) => {
    return new Promise((resolve, reject) => {
      console.log(
        `Failed to get available services, waiting for ${SERVICE_DISCOVERY_TIMEOUT}ms, trying to reconnect`
      );
      reject(err);
    });
  })
};

function discoverServiceAddress(serviceName) {
  console.log(`Trying to discover '${serviceName}' from consul...`);
  return retry(getServiceInfo(serviceName), {
    interval: SERVICE_DISCOVERY_TIMEOUT,
    max_tries: SERVICE_DISCOVERY_RETRIES
  }).then((serviceDiscoveryResult) => {
    let serviceInfo = _.chain(serviceDiscoveryResult).head().pick(['ServiceAddress', 'ServicePort']).value();
    console.log(`Service '${serviceName}' was successfully discovered:`);
    console.log(serviceInfo);
    return Promise.resolve(serviceInfo);
  }).catch((err) => {
    console.error(`Service '${serviceName}' wasn't discovered:`);
    console.error(err);
    return Promise.reject(err);
  })
}

function discoverAvailableServices() {
  console.log(`Trying to discover services from consul...`);
  return retry(getServices, {
    interval: SERVICE_DISCOVERY_TIMEOUT,
    max_tries: SERVICE_DISCOVERY_RETRIES
  }).then((servicesDiscoveryResult) => {
    console.log(servicesDiscoveryResult);
    return Promise.resolve(servicesDiscoveryResult);
  }).catch((err) => {
    console.error(`Service were not discovered`);
    console.error(err);
    return Promise.reject(err);
  })
}

module.exports = {
  discoverServiceAddress: discoverServiceAddress,
  discoverAvailableServices: discoverAvailableServices
};
