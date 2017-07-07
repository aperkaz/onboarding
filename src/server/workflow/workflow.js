const fs = require('fs');
const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
const ServiceClient = require('ocbesbn-service-client');
const RedisEvents = require('ocbesbn-redis-events');
const Sequelize = require('sequelize');
const BlobClient = require('ocbesbn-blob-client');
const bundle = (process.env.NODE_ENV === 'production') ? require(__dirname + '/../../../build/client/assets.json').main.js : 'bundle.js';
const APPLICATION_NAME = process.env.APPLICATION_NAME || 'onboarding';

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
  this.blob = new BlobClient({ consul : { host : 'consul' } });

  function getLanguage(req) {
    let lang;

    if(req.query.lang){
      lang = req.query.lang;
    } else if(req.cookies.OPUSCAPITA_LANGUAGE){
      lang = req.cookies.OPUSCAPITA_LANGUAGE;
    } else{
      lang = 'en';
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
    if(userData.status == 'emailVerified') {
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
            console.log("ERROR: nothing changed! Error during updating contact status.");
          }
        }).catch((err) => {
           console.log("Could not update contact: ", err);
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
            console.log("Event checked for inChannelContractCreate, supplierId=%S, customerId=%s. Nothing updated.", inChannelContract.cupplierId, inChannelContract.customerId);
          }
          else {
            console.log("Event processed for inChannelContractCreate, supplierId=%S, customerId=%s. Updated to connected.", inChannelContract.cupplierId, inChannelContract.customerId);
          }
        }).catch((err) => {
           console.log("Could not update contact: ", err);
        });
    }
  }

  // as we run multiple instances of supplier all event processing must be idempotent until we switch to rabbitmq
  // where we will guarantee that exactly one onboarding instance is consuming the event
  this.events.subscribe('inChannelConfig.updated', updateSupplierInfo);
  this.events.subscribe('inChannelConfig.created', updateSupplierInfo);
  this.events.subscribe('inChannelContract.created', updateSupplierContract);
  this.events.subscribe('user.updated', processUserUpdated.bind(this));


  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));

  /*
     API to load onboarding page
   */
  app.get('/public/landingpage/:tenantId/:campaignId/:contactId', (req, res) => {
    const { campaignId, contactId, tenantId } = req.params;
    const customerId = tenantId.slice(2);

    db.models.Campaign.findOne({
      where: {
        $and: [
          { customerId: customerId },
          { campaignId: campaignId}
        ]
      }
    })
    .then((campaign) => {
      if (!campaign) {
        return Promise.reject('Campaign not found');
      }
      else {
        return db.models.CampaignContact.findById(contactId).then((contact) => {
          if(!contact) {
            return Promise.reject('Contact not found');
          } else {

            let updatePromise = Promise.resolve("update skipped.");
            if(contact.status == req.query.transition) {
              console.log('landing page skipping transition to ' + req.query.transition + ' because already in that status');
            }
            else {
              console.log('updating contact status to ' + req.query.transition);
              updatePromise = updateTransitionState(campaign.type, contactId, req.query.transition)
            }
            return updatePromise
              .then(() => getCustomerData(customerId))
              .then((customerData) => {
                // here we need to check whether campaign.landingPageTemplate is set and
                // if yes, get the customized landing page template from blob store
                const language = getLanguage(req);
                const templatePath = getGenericOnboardingTemplatePath(campaign.campaignType, language)

                res.cookie('OPUSCAPITA_LANGUAGE', language, {maxAge:120000});
                res.render(templatePath, {
                  bundle,
                  invitationCode: contact.invitationCode,
                  customerData,
                  language: {
                    language,
                    isEnglish: language === 'en', // ugly workaround for handlebars language switcher
                    isDeutsch: language === 'de'
                  },
                  transition: req.query.transition,
                  currentService: {
                    name: APPLICATION_NAME
                    //userDetail: userDetail,
                    //tradingPartnerData: JSON.parse(tradingPartnerDetails),
                    //tradingPartnerDetails: tradingPartnerDetails,
                  },
                  helpers: {
                    json: (value) => {
                      return JSON.stringify(value);
                    }
                  }
                });
            return Promise.resolve("redirect sent");
            }).catch((err) => res.status(500).send({error:"unexpected error in update: " + err}));
          }
        }).catch( (err) => res.status(500).send({error:"error loading contact: " + err}));
      }
    })
    .catch((err) => res.status(500).send({ error: 'Error loading campaign: '+ err }))
  });

  /*
    API to update the status of transition.
    TODO: move back to api/transition after adding public entrypoint for email tracking img link
  */
  app.get('/public/transition/:tenantId/:campaignId/:contactId', (req, res) => {
    const { campaignId, contactId, tenantId } = req.params;
    const customerId = tenantId.slice(2);

    db.models.Campaign.findOne({
      where: {
        $and: [
          { customerId: customerId },
          { campaignId: campaignId}
        ]
      }
    })
    .then((campaign) => {
      if (!campaign) return Promise.reject();

      return updateTransitionState(campaign.type, contactId, req.query.transition)
        .then((result) => {
          let contact = result.dataValues;
          if(result.dataValues.status == "loaded"){
            res.statusCode = 302;
            res.setHeader("Location", `/onboarding/public/ncc_onboard?invitationCode=${contact.invitationCode}`);
            res.end()
          }else{
            console.log("updated transition to: " + req.query.transition);
            res.status(200).json({ message: 'OK - Transition updated successfully' })
          }
        })
        .catch((err) => res.status(404).json({ message: 'Requested transition not valid: ' + err }));
    })
    .catch((err) => res.status(404).json({ message: 'Campaign not found: ' +err }))
  });

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

      return Promise.reject('Not possible to update transition.');
    });
  };

  //To send campaign emails.
  const sendMails = () => {

  db.models.CampaignContact.findAll({
      include : { model : db.models.Campaign, required: true },
      where: {
        status: 'invitationGenerated'
      }
  })
    .then((contacts) => {
      async.each(contacts, (contact, callback) => {
        return getCustomerData(contact.Campaign.customerId)
          .spread((customerData) => {
            updateTransitionState('eInvoiceSupplierOnboarding', contact.id, 'sending')
            .then(() => {
              sendEmail(customerData, contact, updateTransitionState, callback);
            })
            .catch((error) => {
              console.log("Error sending email for contact  " + contact.email + " in campaign " + contact.campaignId + ": " + error);
              db.models.CampaignContact.update({ status: 'errorGeneratingInvitation'}, { where: { id: contact.id, status: 'generatingInvitation'}});
            });
          })
          .catch((err)=> {
            console.log("Error sending email for contact  " + contact.email + " in campaign " + contact.campaignId + ". Not able to get customer details from api: " + err);
          });
      }, function(err) {
        if( err ) {
          console.log('Not able to mail this --', err);
        } else {
          console.log('DONE');
        }
      });
    });
  };

  const generateInvitation = () => {
    db.models.CampaignContact.findAll({
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
            contact.dataValues.campaignTool = CAMPAIGNTOOLNAME;
            this.client.post('user', '/onboardingdata', contact, true)
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
    /*db.models.CampaignContact.findAll({
      where: {
        status: 'needsVoucher'
      },
      limit: 20, // threshold
      attributes: Object.keys(db.models.CampaignContact.attributes).concat([
        [Sequelize.literal('(SELECT customerId FROM Campaign WHERE Campaign.id = CampaignContact.campaignId)'), 'customerId']
      ])
      //include: [{
      //  model: db.models.Campaign,
      //  where: { campaignId: Sequelize.col('CampaignContact.id') }
      //}]
  })*/

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
            this.client.post('einvoice-send', '/api/config/voucher', {"supplierId": contact.supplierId, "customerId": contact.Campaign.customerId}, true)
            .spread((result) => {
              return contact.update({
                status: 'serviceConfig',
                serviceVoucherId: result.voucherId
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

  // Scheduler to send mails.
  schedule.scheduleJob(rule, () => sendMails(db));

  getSubscriber().then((subscriber) => {
    subscriber.on("message", (channel, message) => {
      const onboardingUser = JSON.parse(message);
      updateTransitionState('eInvoiceSupplierOnboarding', onboardingUser.contactId, onboardingUser.transition);
    });

    subscriber.subscribe("onboarding");
  });
};
