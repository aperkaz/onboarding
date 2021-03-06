const _ = require('lodash');
const bouncer = require('ocbesbn-bouncer');

const PORT = process.env.PORT || 3002;

const getServerConfig = (db, NODE_ENV) => {
  const serverConfig = {
    common: {
      server: {
        port: PORT,
        staticFilePath: __dirname + '/../static',
      },
      routes: {dbInstance: db},
      enableBouncer: true
    },
    development: {
      server: {
        webpack: {
          useWebpack: true,
          configFilePath: __dirname + '/../../webpack/webpack.development.config.js'
        },
      }
    },
    production: {}
  };

  return _.merge({}, serverConfig.common, serverConfig[NODE_ENV]);
};

module.exports = getServerConfig;
