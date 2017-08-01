'use strict';

const Logger = require('ocbesbn-logger'); // Logger
const db = require('ocbesbn-db-init'); // Database
const server = require('ocbesbn-web-init'); // Web server
const getServerConfig = require('./utils/getServerConfig');

const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = new Logger();
logger.redirectConsoleOut(); // Force anyone using console outputs into Logger format.

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init

db.init({ consul : { host: 'consul' }, retryCount: 50 })
  .then((db) => server.init(getServerConfig(db, NODE_ENV)))
  .catch((e) => { server.end(); throw e; });
