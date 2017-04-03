'use strict';

const server = require('ocbesbn-web-init'); // Web server
const db = require('ocbesbn-db-init'); // Database

const webpackConfig = __dirname + '/webpack.config';

// Basic database and web server initialization.
// See database : https://github.com/OpusCapitaBusinessNetwork/db-init
// See web server: https://github.com/OpusCapitaBusinessNetwork/web-init

  // app.get('/ncc_onboard', (req, res) => {
  //   getAvailableServiceNames().then((serviceNames) => {
  //       let externalHost = req.get('X-Forwarded-Host') || req.get('Host');            
  //       let userData = (req.cookies.CAMPAIGN_INFO != undefined ? JSON.parse(req.cookies.CAMPAIGN_INFO) : "");
  //       let tradingPartnerDetails =  JSON.stringify(userData.tradingPartnerDetails);
  //       let userDetail = JSON.stringify(userData.userDetail);
        
  //       res.render('ncc_onboard', {
  //         availableServices: _.map(serviceNames, (serviceName) => {
  //           return {
  //             name: serviceName,
  //             userDetail: userDetail,
  //             tradingPartnerDetails: tradingPartnerDetails,
  //             currentApplication: serviceName === APPLICATION_NAME,
  //             EXTERNAL_HOST: process.env.EXTERNAL_HOST,
  //             EXTERNAL_PORT: process.env.EXTERNAL_PORT,
  //             location: `${req.protocol}://${externalHost}/${serviceName}`,
  //         }
  //       }),
  //       helpers: {
  //         json: (value) => {
  //           return JSON.stringify(value);
  //         }
  //       }
  //     });
  //   });
  // });

db.init({ consul : { host: 'consul' }, retryCount: 50 })
  .then((db) => server.init({ routes: { dbInstance: db }, webpack: { useWebpack: true } }))
  .catch((e) => { server.end(); throw e; });
