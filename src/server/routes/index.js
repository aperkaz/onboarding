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
const templates = require('./templates');
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
  templates(app, db);
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

  function getContact(customerId, campaignId)
  {
      return db.models.Campaign.findOne({
          where: {
              campaignId: campaignId,
              customerId: customerId
          }
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
  }

  const processEmailTemplate = (languageId, contact, customer, handlebarsConfig) =>
  {
    let languageTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/email/generic_${languageId}.handlebars`;
    let genericTemplatePath = `${process.cwd()}/src/server/templates/${contact.Campaign.campaignType}/email/generic.handlebars`;
    let templatePath = fs.existsSync(languageTemplatePath) ? languageTemplatePath : genericTemplatePath;

    let template = fs.readFileSync(templatePath, 'utf8');

    const html = Handlebars.compile(template)({
        customer: customer,
        campaignContact: contact,
        url: handlebarsConfig.url,
        blobUrl: handlebarsConfig.blobUrl,
        emailOpenTrack: handlebarsConfig.emailOpenTrack
    });

    return html;
  }

  app.get('/public/registration/email/:invitationCode', (req, res) =>
  {
    return db.models.CampaignContact.findOne({
        include : {
            model : db.models.Campaign,
            required: true
        },
        where: {
            invitationCode: req.params.invitationCode
        }
    })
    .then(contact =>
    {
        if(contact)
        {
            const endpoint = '/api/customers/' + contact.Campaign.customerId;

            return req.opuscapita.serviceClient.get('customer', endpoint, true)
              .then(customer => [ contact, customer ]);
        }
        else
        {
            return [ null, null ];
        }
    })
    .then(([contact, customer]) => {
        return processEmailTemplate(
            contact.Campaign.languageId,
            contact,
            customer,
            {
                url : "/onboarding",
                blobUrl : "/blob",
                emailOpenTrack : `/public/transition/c_${contact.Campaign.customerId}/${contact.Campaign.campaignId}/${contact.id}?transition=read`
            }
        );
    })
    .then(html => {
        res.send(html);
    })
    .catch(error => res.status(400).json({ message : error.message }));
  })

  app.use('/public/api/fixtures', cond(fixturesGenerator(db)));

  // Always return a promise.
  return Promise.resolve();
}
