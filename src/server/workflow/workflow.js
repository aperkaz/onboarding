const fs = require('fs');
const async = require('async');
const { getWorkflowTypes } = require('../../utils/workflowConstant');
const allowedTransitions = require('../api/allowedTransitions');
const schedule = require('node-schedule');
const ServiceClient = require('ocbesbn-service-client');
const RedisEvents = require('ocbesbn-redis-events');
const config = require('ocbesbn-config');
const util = require('util');
const i18n = require('./i18n');

const Logger = require('ocbesbn-logger');
const Templates = require('../api/Templates');

let logger = new Logger({});

let rule = new schedule.RecurrenceRule();
rule.second = 0;
const { getSubscriber } = require("./redisConfig");

const CAMPAIGNTOOLNAME = "opuscapitaonboarding";

module.exports = function(app, db) {
  /*
     API to get list of workflow.
  */

  this.client = new ServiceClient({ consul : { host : 'consul' } });
  this.events = new RedisEvents({ consul : { host : 'consul' } });

  config.get('ext-url/', true).then(props =>
  {
      this.extUrlConfigs = {
          scheme : props['ext-url/scheme'],
          host : props['ext-url/host'],
          port : props['ext-url/port']
      }
  })
  .catch(e => console.error(e));

  function getLanguage(req, altLanguage) {
    let lang;
    let langRe = /^[A-Za-z]{2}$/;

    if(req.query.lang && langRe.test(req.query.lang)){
      lang = req.query.lang;
    } else if(req.cookies.OPUSCAPITA_LANGUAGE && langRe.test(req.cookies.OPUSCAPITA_LANGUAGE)){
      lang = req.cookies.OPUSCAPITA_LANGUAGE;
    } else{
      lang = altLanguage || 'en';
    }

    return lang;
  }

  function getGenericOnboardingTemplatePath(campaignType, language) {
    let templatePath = `${campaignType}/generic_landingpage`;

    if (fs.existsSync(__dirname + `/../templates/${templatePath}_${language}.handlebars`)) {
      templatePath = `${campaignType}/generic_landingpage_${language}`;
    }

    return templatePath;
  }

  function getCustomerData(customerId) {
    return this.client.get('customer', `/api/customers/${customerId}`, true).spread((data) => data);
  }

  function processUserUpdated(userData) {
    console.log('processing user.updated event, user ' + userData.id + ", status " + userData.status);
    if(userData.status === 'emailVerified') {
      this.client.get('user', '/onboardingdata/'+userData.id, true).spread((onboardData, response) => {
        if (onboardData
          && onboardData.campaignTool === 'opuscapitaonboarding'
          && onboardData.invitationCode) {

          console.log('user ' + userData.id + ' has onboardData ' + JSON.stringify(onboardData) + 'going to try update...');

          db.models.CampaignContact.update({
            status: 'registered',
            userId: userData.id
          }, {
            where: {
              invitationCode: onboardData.invitationCode,
              status: 'loaded'
            }
          }).spread((count, rows) => {
            if (!count) {
              console.log("Processed event user.updated of user %s, nothing changed.", userData.id);
            }
            else {
              console.log("Processed event user.updated of user %s, updated status to registered.", userData.id);
            }
          }).catch((err) => {
            console.log("Campaign Contact for this invitation code not found or already registered", err);
          });
        }
        else {
          console.log('update condition not met, onboardData: ' + JSON.stringify(onboardData));
        }
      }).catch(err => {
        console.log('unable to get onboarddata for user ' + userData.id + ": " + err);
      });
    }
    else if (userData.status == 'registered') {
      db.models.CampaignContact.update({
        supplierId: userData.supplierId,
        status: 'needsVoucher'
      }, {
        where: {
          status: { $in: ['loaded','registered']},
          userId: userData.id,
          supplierId: null
        }
      }).spread((count, rows) => {
        if (!count) {
          console.log("Processed event user.updated of user %s, nothing changed.", userData.id);
        }
        else {
          console.log("Processed event for user.updated of user %s, supplier %s associated.", userData.id, userData.supplierId);
        }
      }).then ( () => {
        console.log("triggering immediate voucher generation");
        eInvoiceSupplierOnboarding_generateVoucher();
      }).catch((err) => {
          console.log("Supplier " + userData.supplierId + " couldn't be assigned to " + userData.id + " after user.updated event: ", err);
      });
    }
  }

  function updateSupplierInfo(supplierServiceConfig) {
    console.log("Processing inChannelConfig event " + util.inspect(supplierServiceConfig,{breakLength:Infinity}) + "...");
    if (supplierServiceConfig.status == 'approved') {
      db.models.CampaignContact.update({
        status: 'onboarded'
      }, {
        where: {
          supplierId: supplierServiceConfig.supplierId,
          serviceVoucherId: supplierServiceConfig.voucherId
        }
      }).spread((count, rows) => {
        if (!count) {
          console.log("Processed inChannelConfig event " + util.inspect(supplierServiceConfig,{breakLength:Infinity}) + ": nothing changed!");
        }
        else {
          console.log("Processed inChannelConfig event, updated supplier " + supplierServiceConfig.supplierId + ", voucherId= " + supplierServiceConfig.voucherId);
        }
      }).catch((err) => {
        console.log("Processed inChannelConfig event " + util.inspect(supplierServiceConfig,{breakLength:Infinity}) + ". Could not update contact: ", err);
      });
    }
  }

  function updateSupplierContract(inChannelContract) {
    if (inChannelContract.status == 'approved') {
      db.models.CampaignContact.update({
        status: 'connected'
      }, {
        where: {
          supplierId: inChannelContract.supplierId,
          serviceVoucherId: inChannelContract.voucherId
        }
      }).spread((count, rows) => {
          if (!count) {
            console.log("Event checked for inChannelContractCreate, supplierId=" + inChannelContract.supplierId + ", customerId=" + inChannelContract.customerId + ". Nothing updated.");
          }
          else {
            console.log("Event processed for inChannelContractCreate, supplierId=" + inChannelContract.supplierId + ", customerId=" + inChannelContract.customerId + ". Updated to connected.");
          }
        }).catch((err) => {
           console.log("Could not update contact: ", err);
        });
    }
  }

  /**
   * function to be executed on reciving useronboarddata.created event
   * @param {Object} onboardingData
   */
  function processOnboardCreation(onboardingData) {
    let invitationCode = onboardingData.invitationCode;
    let type = onboardingData.type;

    let userDetails = onboardingData.userDetails;
    let campaignDetails = onboardingData.campaignDetails;
    //let tradingPartnerDetails = onboardingData.tradingPartnerDetails;
    let email = userDetails && userDetails.email ? userDetails.email : '';
    let campaignId = campaignDetails ? campaignDetails.id : '';

    if (type == 'singleUse')
      return logger.info(`Event:onboardingdata.created:${campaignId}, Skipping contact creation, campaign is not multi use for invitation code '${invitationCode}', email '${email}'`);

    if (!email)
      return logger.warn(`Event:onboardingdata.created:${campaignId}, Email for invitation code '${invitationCode}'`);

    if (!campaignId)
      return logger.warn(`Event:onboardingdata.created:${campaignId}, Campaign details not found for invitation code '${invitationCode}', email '${email}'`);

    /*if (!tradingPartnerDetails)
      return logger.warn(`Event:onboardingdata.created:${campaignId}, Trading partner details not found for invitation code '${invitationCode}', email '${email}'`);
    */
    if (!userDetails)
      return logger.warn(`Event:onboardingdata.created:${campaignId}, User details not found for invitation code '${invitationCode}', email '${email}'`);

    db.models.CampaignContact.create({
      email: email,
      userId: email,
      invitationCode: invitationCode,
      campaignId: campaignId,
      status: 'registered',
      contactFirstName: userDetails.firstName,
      contactLastName: userDetails.lastName,
      /*companyName: tradingPartnerDetails.name,
      vatIdentNo: tradingPartnerDetails.vatIdentNo,
      taxIdentNo: tradingPartnerDetails.taxIdentNo,
      dunsNo: tradingPartnerDetails.dunsNo,
      commercialRegisterNo: tradingPartnerDetails.commercialRegisterNo,
      city: tradingPartnerDetails.city,
      country: tradingPartnerDetails.country*/
    })
    .then((data) => {
      logger.info(`Event:onboardingdata.created:${campaignId}, Successfully completed onboardingdata.created event for invitation code '${invitationCode}', email '${email}'`);
    })
    .catch((err) => {
      logger.warn(`Event:onboardingdata.created:${campaignId}, Error on creating onboarding data for invitation code '${invitationCode}', email '${email}'`, err);
    });
  }

  // as we run multiple instances of supplier all event processing must be idempotent until we switch to rabbitmq
  // where we will guarantee that exactly one onboarding instance is consuming the event
  this.events.subscribe('inChannelConfig.updated', updateSupplierInfo);
  this.events.subscribe('inChannelConfig.created', updateSupplierInfo);
  this.events.subscribe('inChannelContract.created', updateSupplierContract);
  this.events.subscribe('user.updated', processUserUpdated.bind(this));
  this.events.subscribe('onboardingdata.created', processOnboardCreation);


  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));


  /*
    API to queued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    const { campaignId } = req.params;
    const userData = req.opuscapita.userData();

    const queueCampaignContacts = (id) => db.models.CampaignContact.update({ status: 'queued' }, {
      where: {
        campaignId: id,
        status: 'new'
      }
    });

    db.models.Campaign.findOne({
      where: {
        campaignId,
        customerId: userData.customerid
      }
    })
    .then((campaign) => {
      if (!campaign) return Promise.reject();

      return campaign.update({ status: 'inprogress' })
        .then(() => queueCampaignContacts(campaign.id))
        .then(() => res.status(200).json(campaign))
    })
    .catch((err) => {
      console.log("err",err);
      res.status(500).json({message: 'Not able to start campaign.'})
    });
  });

  //Update campaign contact's transition state.
  const updateTransitionState = (campaignType, contactId, transitionState) => {
    return db.models.CampaignContact.findById(contactId).then((contact) => {
      const transitions = getPossibleTransitions('eInvoiceSupplierOnboarding', contact.dataValues.status);

      if (contact && transitions.indexOf(transitionState) !== -1) {
        return contact.updateAttributes({
          status: transitionState,
          lastStatusChange: new Date()
        });
      }

      console.log("Error updating transition states for CampaignContact " + contactId + ". Current state is: " + contact.dataValues.status + ", requested Status is: ", transitionState);
      return Promise.reject('Sorry, we cannot update CampaignContact with Status ' + contact.dataValues.status + ' to status ' + transitionState + '.');
    });
  };

  const sendMails = () =>
  {
      const templatesApi = new Templates(db, client);

      db.models.CampaignContact.findAll({
          include : { model : db.models.Campaign, required : true },
          where : { status : 'invitationGenerated' },
          limit : 25
      })
      .map(contact =>
      {
          const allowed = allowedTransitions.eInvoiceSupplierOnboarding[contact.status].indexOf('sending') !== -1;

          if(allowed)
          {
              return contact.updateAttributes({
                  status : 'sending',
                  lastStatusChange : new Date()
              })
              .then(() => contact);
          }
          else
          {
              return false;
          }
      })
      .map(contact =>
      {
          if(contact)
          {
              let baseUrl = `${this.extUrlConfigs.scheme}://${this.extUrlConfigs.host}`;

              if(this.extUrlConfigs.port)
                 baseUrl += `:${this.extUrlConfigs.port}`;

              return templatesApi.renderPublicTemplate({
                  type : 'email',
                  baseUrl,
                  customerId : contact.Campaign.customerId,
                  campaignId : contact.Campaign.campaignId,
                  contactId : contact.id,
                  transition : 'loaded',
                  invitationCode : contact.invitationCode,
                  language : contact.Campaign.languageId,
              })
              .then(({ result, templateValues }) => ({ contact, html : result, templateValues }));
          }

          return { };
      })
      .map(({ contact, html, templateValues }) =>
      {
          if(html)
          {
              let subject = i18n[contact.Campaign.languageId]['eInvoiceSupplierOnboarding.email.subject'];
              subject = subject.replace(/{[\w|\d]*}/g, templateValues.customer.customerName);

              return client.post('email', '/api/send', {
                  to : contact.email,
                  subject,
                  html
              })
              .then(() =>
              {
                  return contact.updateAttributes({
                      status : 'sent',
                      lastStatusChange : new Date()
                  })
              })
              .catch(e =>
              {
                  return contact.updateAttributes({
                      status : 'bounced',
                      lastStatusChange : new Date()
                  });
              })
          }
      });
  }

  const generateInvitation = () => {
    db.models.CampaignContact.findAll({
      include : { model : db.models.Campaign, required: true },
      where: {
        status: 'queued'
      },
      limit: 20 // threshold
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {
        db.models.CampaignContact.update({
          status: 'generatingInvitation'
        }, {
          where: {
            id: contact.id,
            status: 'queued' // doublecheck it wasn't changed meanwhile by other job
          }
        }).then((count, rows) => {
          if (!count) { // updating by ID results with only one or none rows affected
            console.log( "Already invited" + contact.email )
          } else {
            let data = {
                type: 'singleUse',
                campaignTool: CAMPAIGNTOOLNAME,
                userDetails: {
                    firstName: contact.contactFirstName,
                    lastName: contact.contactLastName,
                    email: contact.email,
                    campaignId: contact.Campaign.campaignId
                },
                tradingPartnerDetails: {
                    name: contact.companyName,
                    vatIdentNo: contact.vatIdentNo,
                    taxIdentNo: contact.taxIdentNo,
                    dunsNo: contact.dunsNo,
                    commercialRegisterNo: contact.commercialRegisterNo,
                    city: contact.city,
                    country: contact.country
                },
                campaignDetails: {
                    customerSupplierId: contact.customerSupplierId,
                    id: contact.campaignId,
                    campaignId: contact.Campaign.campaignId,
                    contactId: contact.id
                }
            };
            this.client.post('user', '/onboardingdata', data, true)
              .spread((result) => {
                return contact.update({
                  invitationCode: result.invitationCode,
                  status: 'invitationGenerated'
                }).then(function () {
                  callback(null);
                })
                .catch((err)=> {
                  console.log("Error generating invitationCode: " + err + ", return status is " + err.response.statusCode);
                  db.models.CampaignContact.update({ status: 'errorGeneratingInvitation'}, { where: { id: contact.id, status: 'generatingInvitation'}});
                });
              });
          }
        });
      }, function(err){
        if( err ) {
          console.log('Not able to invite --', err);
        } else {
          console.log('DONE');
        }
      });
    });
  };

  const eInvoiceSupplierOnboarding_generateVoucher = () => {
  db.models.CampaignContact.findAll({
      include : { model : db.models.Campaign, required: true },
      limit: 20,
      where: {
        status: 'needsVoucher'
      }
  })
    .then((contacts) => {
      async.each(contacts, (contact, callback) => {
        db.models.CampaignContact.update({
          status: 'generatingVoucher'
        }, {
          where: {
            id: contact.id,
            status: 'needsVoucher' // doublecheck it wasn't changed meanwhile by other job
          }
        }).then((count, rows) => {
          if (!count) { // updating by ID results with only one or none rows affected
            console.log( "" + contact.email + " already picked up for voucher generation, skipping.")
          } else {
            contact.dataValues.campaignTool = CAMPAIGNTOOLNAME;
            // '{"supplierId":"XYC", "customerId":"OC", "inputType":"pdf", "status":"new", "createdBy":"me"}'
            let client = this.client;  // this.client is not visible sub Promise scope.
            let payload = {
              "supplierId": contact.supplierId,
              "customerId": contact.Campaign.customerId,
              customerSupplierId: contact.customerSupplierId
            };
            console.log("calling /api/config/voucher with " + util.inspect(payload,{breakLength:Infinity}));
            this.client.post('einvoice-send', '/api/config/voucher', payload, true)
            .spread((result) => {
              console.log("result from /api/config/voucher: " + util.inspect(result,{breakLength:Infinity}));
              return contact.update({
                status: 'serviceConfig',
                serviceVoucherId: result.id
              }).then(function () {
                // now generate the notification
                return client.post('notification', '/api/notifications', {"supplierId":contact.supplierId, "status": "new", "message": "You received a voucher for eInvoice-Sending", "destinationLink": "/einvoice-send/"}, true)
                .then((result) => {
                  console.log("Notification generated for contact " + contact.id + " in campaign " + contact.campaignId + " of customer " + contact.Campaign.customerId);
                  callback(null);
                })
                .catch((err) => {
                  callback(err);
                })
              }).catch((err) => {
                callback(err);
              })
            })
            .catch((err)=> {
              console.log("Error generating voucher: " + err + ", return status is " + err.response.statusCode);
              db.models.CampaignContact.update({ status: 'errorGeneratingVoucher'}, { where: { id: contact.id, status: 'generatingVoucher'}});
            });
          }
        });
      }, function(err){
        if( err ) {
          console.log('Not able to generate voucher --', err);
        } else {
          console.log('DONE');
        }
      });
    });
  };

  // Scheduler to generate invitations.
  schedule.scheduleJob(rule, () => eInvoiceSupplierOnboarding_generateVoucher(db));

  // Scheduler to generate invitations.
  schedule.scheduleJob(rule, () => generateInvitation(db));

  setInterval(() => sendMails(), 10000);

  getSubscriber().then((subscriber) => {
    subscriber.on("message", (channel, message) => {
      const onboardingUser = JSON.parse(message);
      updateTransitionState('eInvoiceSupplierOnboarding', onboardingUser.contactId, onboardingUser.transition);
    });

    subscriber.subscribe("onboarding");
  });
};
