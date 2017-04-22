'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database
const getServerConfig = require('./utils/getServerConfig');

const NODE_ENV = process.env.NODE_ENV || 'development';

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init

db.init({ consul : { host: 'consul' }, retryCount: 50 })
  .then((db) => server.init(getServerConfig(db, NODE_ENV)))
  .catch((e) => { server.end(); throw e; });
