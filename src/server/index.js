'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database

const webpackConfig = __dirname + '/webpack.config';

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init

db.init({ consul : { host: 'consul' }, retryCount: 50 })
  .then((db) => server.init({ port: 3002, routes: { dbInstance: db }, webpack: { useWebpack: true } }))
  .catch((e) => { server.end(); throw e; });
