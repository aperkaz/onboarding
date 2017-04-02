'use strict';

const path = require('path');
const Promise = require('bluebird');
const epilogue = require('epilogue');
const express = require('express');
const webpack = require('webpack');
const _ = require('lodash');

const campaignRoutes = require('./campaign');
const campaignContactRoutes = require('./campaignContact');
const campaignContactImport = require('./campaignContactImport');
const workflow = require('../workflow/workflow');

/**
 * Initializes all routes for RESTful access.
 *
 * @param {object} app - [Express]{@link https://github.com/expressjs/express} instance.
 * @param {object} db - If passed by the web server initialization, a [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - Everything from [config.routes]{@link https://github.com/OpusCapitaBusinessNetwork/web-init} passed when running the web server initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Minimum setup]{@link https://github.com/OpusCapitaBusinessNetwork/web-init#minimum-setup}
 */

module.exports.init = function(app, db, config) {
  // Register routes here.
  // Use the passed db parameter in order to use Epilogue auto-routes.
  // Use require in order to separate routes into multiple js files.

  epilogue.initialize({
    app: app,
    sequelize: db,
    base: '/api'
  });

  campaignRoutes(epilogue, db);
  campaignContactImport(app, db);
  campaignContactRoutes(epilogue, db);
  workflow(app, db);

  if (process.env.NODE_ENV === 'development') {
    const exphbs = require('express-handlebars');
    const webpackConfig = require('../webpack.config');
    const compiler = webpack([webpackConfig]);
    const webpackDevMiddleware = require('webpack-dev-middleware');
    // const webpackHotMiddleware = require('webpack-hot-middleware');
    const APPLICATION_NAME = process.env.APPLICATION_NAME || 'onboarding';

    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');
    app.set('views', path.resolve(__dirname + '/../templates'));
    app.use('/static', express.static(__dirname + '/../static'));

    app.use(webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    }));

    app.get(
      [
        '/campaigns/',
        '/campaigns/create',
        '/campaigns/edit/:campaignId',
        '/campaigns/dashboard',
        '/campaigns/edit/:campaignId/contacts',
        '/campaigns/edit/:campaignId/process',
        '/campaigns/campaignPage/:campaignId/:contactId',
        '/campaigns/edit/:campaignId/template/onboard',
        '/campaigns/edit/:campaignId/template/email'
      ],
      (req, res) => {
        const externalHost = req.get('X-Forwarded-Host') || req.get('Host');

        res.render('index', {
          currentService: {
            name: APPLICATION_NAME,
            location: `${req.protocol}://${externalHost}`,
          },
          helpers: {
            json: JSON.stringify
          }
        });
      });

    // app.get('/ncc_onboard', (req, res) => {
    //   console.log('req.cookies.CAMPAIGN_INFO---->', req.cookies.CAMPAIGN_INFO);
    //   getAvailableServiceNames().then((serviceNames) => {
    //     const externalHost = req.get('X-Forwarded-Host') || req.get('Host');
    //     const userData = (req.cookies.CAMPAIGN_INFO !== undefined ? JSON.parse(req.cookies.CAMPAIGN_INFO) : "");
    //
    //     res.render('ncc_onboard', {
    //       availableServices: _.map(serviceNames, (serviceName) => {
    //         return {
    //           name: serviceName,
    //           userData: userData,
    //           currentApplication: serviceName === APPLICATION_NAME,
    //           EXTERNAL_HOST: process.env.EXTERNAL_HOST,
    //           EXTERNAL_PORT: process.env.EXTERNAL_PORT,
    //           location: `${req.protocol}://${externalHost}/${serviceName}`
    //         }
    //       }),
    //       helpers: {
    //         json: JSON.stringify
    //       }
    //     });
    //   });
    // });
  }

  // Always return a promise.
  return Promise.resolve();
}
