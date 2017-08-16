'use strict';

const path = require('path');
const Promise = require('bluebird');
const express = require('express');
const fs = require('fs');

const _ = require('lodash');
const fixturesGenerator = require('../db/fixtures/index.fixture');

const campaignRoutes = require('./campaign');
const campaignContactRoutes = require('./campaignContact');
const campaignContactImport = require('./campaignContactImport');
const workflow = require('../workflow/workflow');
const bundle = (process.env.NODE_ENV === 'production') ? require(__dirname + '/../../../build/client/assets.json').main.js : 'bundle.js';
const Handlebars = require('handlebars');

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
  // Use require in order to separate routes into multiple js files.

  campaignRoutes(app, db);
  campaignContactImport(app, db);
  campaignContactRoutes(app, db);
  workflow(app, db);

  const exphbs = require('express-handlebars');
  const APPLICATION_NAME = process.env.APPLICATION_NAME || 'onboarding';

  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');
  app.set('views', path.resolve(__dirname + '/../templates'));
  app.use('/static', express.static(__dirname + '/../../../build/client'));
  app.use('/static', express.static(__dirname + '/../static'));

  app.get(
    [
      '/',
      '/create',
      '/edit/:campaignId',
      '/dashboard',
      '/edit/:campaignId/contacts',
      '/edit/:campaignId/process',
      '/edit/:campaignId/template/onboard',
      '/edit/:campaignId/template/email',
      '/templates'
    ],
    (req, res) => {
      const externalHost = req.get('X-Forwarded-Host') || req.get('Host');
      const externalScheme = req.get('X-Forwarded-Proto') || req.protocol;

      res.render('index', {
        bundle,
        currentService: {
          name: APPLICATION_NAME,
          location: `${externalScheme}://${externalHost}/${APPLICATION_NAME}`
        },
        currentUserData: req.opuscapita.userData() || {},
        helpers: {
          json: JSON.stringify
        }
      });
    });

  const cond = (proceed) => {
    return (req, res, next) => {
      const externalHost = req.get('X-Forwarded-Host') || req.get('Host');
      if (!_.includes(['127.0.0.1:8080', 'localhost:8080'], externalHost)) {
        return next();
      }
      else {
        return proceed(req, res, next)
      }
    }
  }

  function getContactAndCustomer(req)
  {
      return db.models.Campaign.findOne({
          where: {campaignId: req.params.campaignId}
      })
      .then ((campaign) => {
          return db.models.CampaignContact.findOne({
              include : {
                  model : db.models.Campaign,
                  required: true
              },
              where: {
                  campaignId: campaign.id
              }
          })
      })
      .then(contact =>
      {
          const endpoint = '/api/customers/' + contact.Campaign.customerId;

          return req.opuscapita.serviceClient.get('customer', endpoint, true)
            .spread(customer => [ contact, customer ]);
      });
  }

  app.get('/preview/:campaignId/template/email', (req, res) =>
  {
      getContactAndCustomer(req).spread((contact, customer) =>
      {
          let languageId = req.opuscapita.userData('languageId');
          let languageTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/email/generic_${languageId}.handlebars`;
          let genericTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/email/generic.handlebars`;
          let templatePath = fs.existsSync(languageTemplatePath) ? languageTemplatePath : genericTemplatePath;

          let template = fs.readFileSync(templatePath, 'utf8'); // TODO: Do this using a cache...

          /* Dummies */
          customer = customer || {
          };

          contact = contact || {
              Campaign : {

              }
          }

          const html = Handlebars.compile(template)({
              customer: customer,
              campaignContact: contact,
              url: '',
              blobUrl: '/blob',
              emailOpenTrack: ''
          });

          res.send(html);
      })
      .catch(error => res.status(400).json({ message : error.message }));
  });

  app.get('/preview/:campaignId/template/landingpage', (req, res) =>
  {
      getContactAndCustomer(req).spread((contact, customer) =>
      {
          let languageId = req.opuscapita.userData('languageId');
          let languageTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/generic_landingpage_${languageId}.handlebars`;
          let genericTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/generic_landingpage.handlebars`;
          let templatePath = fs.existsSync(languageTemplatePath) ? languageTemplatePath : genericTemplatePath;

          let template = fs.readFileSync(templatePath, 'utf8'); // TODO: Do this using a cache...

          customer = customer || {
          };

          const html = Handlebars.compile(template)({
              customerData: customer,
              currentService : {
                  name : 'onboarding'
              }
          });

          res.send(html);
      });
  });

  app.use('/public/api/fixtures', cond(fixturesGenerator(db)));

  // Always return a promise.
  return Promise.resolve();
}
