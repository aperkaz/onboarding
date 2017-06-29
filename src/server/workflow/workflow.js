const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
const ServiceClient = require('ocbesbn-service-client');
const RedisEvents = require('ocbesbn-redis-events');
const Sequelize = require('sequelize');
let rule = new schedule.RecurrenceRule();
rule.second = 0;
const { getSubscriber } = require("./redisConfig");

const PORT = process.env.EXTERNAL_PORT;
const HOST = process.env.EXTERNAL_HOST;

const CAMPAIGNTOOLNAME = "opuscapitaonboarding";

module.exports = function(app, db) {
  /*
     API to get list of workflow.
  */

  this.client = new ServiceClient({ consul : { host : 'consul' } });
  this.events = new RedisEvents({ consul : { host : 'consul' } });

  function associateSupplier(userData) {
    db.models.CampaignContact.update({
      supplierId: userData.supplierId,
      status: 'needsVoucher'
    }, {
      where: {
        status: 'registered',
        userId: userData.id,
        supplierId: null
      }
    }).spread((count, rows) => {
      if (!count) {
        console.log("Processed event for userUpdate of user %s, nothing changed.", userData.id);
      }
      else {
        console.log("Processed event for userUpdate of user %s, supplier %s associated.", userData.id, userData.supplierId);
        // here we would trigger internal event about contact has been associated to supplier !
        // for now hardcoded solution for eInvoiceSupplierOnboarding
      }
    }).catch((err) => {
        console.log("Supplier couldn't be assigned to contact", err);
    });
  }

  function updateUserRegistered(userData) {
    this.client.get('user', '/onboardingdata/'+userData.id, true).spread((onboardData, response) => {
      if (onboardData
        && onboardData.campaignTool === 'opuscapitaonboarding'
        && onboardData.invitationCode) {
        db.models.CampaignContact.update({
          status: 'registered',
          userId: userData.id
        }, {
          where: {
            invitationCode: onboardData.invitationCode,
            status: 'loaded'
          }
        })
      }
    }).spread((count, rows) => {
      if (!count) {
        console.log("Processing user event for user " + userData.id + ", no update!");
      }
      else {
        console.log("Processing user event for user " + userData.id + ", updated status to registered.");
      }
    }).catch((err) => {
      console.log("Campaign Contact for this invitation code not found or already registered", err);
    });
  }

  function updateSupplierInfo(supplierServiceConfig) {
    if (supplierServiceConfig.status == 'active') {
      db.models.CampaignContact.update({
        status: 'onboarded'
      }, {
        where: {
          supplierId: supplierServiceConfig.supplierId
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

  // as we run multiple instances of supplier all event processing must be idempotent until we switch to rabbitmq 
  // where we will guarantee that exactly one onboarding instance is consuming the event
  this.events.subscribe('inChannelConfig.updated', updateSupplierInfo);
  this.events.subscribe('user.updated', updateUserRegistered.bind(this));
  this.events.subscribe('user.updated', associateSupplier.bind(this));


  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));

  /*
     API to load onboarding page
   */
  app.get('/public/landingpage/:tenantId([c|s]_[\w]{1,})/:campaignId/:contactId', (req, res) => {
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
              updatePromise =  updateTransitionState(campaign.type, contactId, req.query.transition)
            }
            return updatePromise.then( () => {
              let fwdUri = `/onboarding/public/ncc_onboard?invitationCode=${contact.invitationCode}`;
              console.log('redirecting to landing page ' + fwdUri);
              res.redirect(fwdUri);
              return Promise.resolve("redirect sent");
            }).catch((err) => res.status(500).send({error:"unexpected error in update: " + err}));
          }
        }).catch( (err) => res.status(500).send({error:"error loading contact: " + err}));
      }
    })
    .catch(() => res.status(500).send({ error: 'Error loading campaign: '+ err }))
  });

  /*
    API to update the status of transition.
    TODO: move back to api/transition after adding public entrypoint for email tracking img link
  */
  app.get('/public/transition/:tenantId([c|s]_[\w]{1,})/:campaignId/:contactId', (req, res) => {
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
      attributes: Object.keys(db.models.CampaignContact.attributes).concat([
        [Sequelize.literal('(SELECT customerId FROM Campaign WHERE Campaign.id = CampaignContact.campaignId)'), 'tenantId']
      ]),
      where: {
        status: 'invitationGenerated'
      },
      raw: true,
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {
        let sender = "opuscapita_noreply";
        let subject = "NCC Svenska AB asking you to connect eInvoicing";
        updateTransitionState('eInvoiceSupplierOnboarding', contact.id, 'sending')
          .then(() => {
            sendEmail(sender, contact, subject, updateTransitionState, callback);
          }).catch((error) => {
          console.log(error);
        });
      }, function(err){
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
                }).catch((err) => {
                  callback(err);
                })
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
    }).then((contacts) => {
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
            this.client.post('einvoice-send', '/config/voucher', {"supplierId": contact.cupplierId, "customerId": contact.customerId}, true)
              .spread((result) => {
                return contact.update({
                  //invitationCode: result.invitationCode, // do we need the voucher code to be accessible from the contact?
                  status: 'serviceConfig'
                }).then(function () {
                  callback(null);
                }).catch((err) => {
                  callback(err);
                })
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
