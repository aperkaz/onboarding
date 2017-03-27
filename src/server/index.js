'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database

const webpackConfig = __dirname + '/webpack.config';

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init

db.init({ mode : db.Mode.Dev, consul : { host : process.env.CONSUL_HOST }, data : { addTestData : true } })
  .then((db) => server.init({ server: { mode : server.Server.Mode.Dev,  }, routes : { dbInstance : db }, webpack: { useWebpack: true }, serviceClient: { injectIntoRequest: true, consul: { host: process.env.CONSUL_HOST } } }))
  .catch((e) => { server.end(); throw e; });
