"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const configureDatabase = require('./db');
const registerRestRoutes = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const getAvailableServiceNames = require('../utils/serviceDiscovery').getAvailableServiceNames;
const APPLICATION_NAME = process.env.APPLICATION_NAME || 'campaigns';

const app = express();
const mode = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3002;
const host = process.env.HOST_IP || '0.0.0.0';

const webpackConfig = require('../../webpack.config.js');
const compiler = webpack([webpackConfig]);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// register rest routes implemented using epilogues+sequelize only after connecting to db
configureDatabase().then((db) => {
  registerRestRoutes(app, db);
}).catch((err) => {
  console.log(err);
});

let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}
app.use(allowCrossDomain);

console.log(`Starting application in '${mode}' mode...`);
if (mode === 'production' || mode === 'staging') {
  // in case of production env - we build bundle and add it a static resource
  compiler.run(function(err, stats) {
    console.log(stats.toJson("errors-only"));
    app.use('/static', express.static(__dirname + '/../../build'));
  });
} else { // the other means env = 'development'
  const exphbs = require('express-handlebars');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');
  app.set('views', path.resolve(__dirname + '/templates'));
  app.use(express.static(__dirname + '/public'));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true
  }));
  app.use(webpackHotMiddleware(compiler));
  app.use(cookieParser());
  app.get(
    [
      '/',
      '/create',
      '/edit/:campaignId',
      '/dashboard',
      '/edit/:campaignId/contacts',
      '/edit/:campaignId/process',
      '/campaignPage/:campaignId/:contactId',
      '/edit/:campaignId/template/onboard',
      '/edit/:campaignId/template/email'
    ],
    (req, res) => {
      getAvailableServiceNames().then((serviceNames) => {
        let externalHost = req.get('X-Forwarded-Host') || req.get('Host');
        res.render('index', {
          availableServices: _.map(serviceNames, (serviceName) => {
            return {
              name: serviceName,
              location: `${req.protocol}://${externalHost}/${serviceName}`,
              currentApplication: serviceName === APPLICATION_NAME
            }
          }),
          helpers: {
            json: (value) => {
              return JSON.stringify(value);
            }
          }
        });
      });
    });

  app.get('/ncc_onboard', (req, res) => {
    getAvailableServiceNames().then((serviceNames) => {
        let externalHost = req.get('X-Forwarded-Host') || req.get('Host');            
        let userData = (req.cookies.CAMPAIGN_INFO != undefined ? JSON.parse(req.cookies.CAMPAIGN_INFO) : "");
        let tradingPartnerDetails =  JSON.stringify(userData.tradingPartnerDetails);
        let userDetail = JSON.stringify(userData.userDetail);
        
        res.render('ncc_onboard', {
          availableServices: _.map(serviceNames, (serviceName) => {
            return {
              name: serviceName,
              userDetail: userDetail,
              tradingPartnerDetails: tradingPartnerDetails,
              currentApplication: serviceName === APPLICATION_NAME,
              EXTERNAL_HOST: process.env.EXTERNAL_HOST,
              EXTERNAL_PORT: process.env.EXTERNAL_PORT,
              location: `${req.protocol}://${externalHost}/${serviceName}`,
          }
        }),
        helpers: {
          json: (value) => {
            return JSON.stringify(value);
          }
        }
      });
    });
  });
}

// launch application
app.listen(port, host, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`The server is running at http://${host}:${port}/`);
});
