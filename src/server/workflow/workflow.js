const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
const ServiceClient = require('ocbesbn-service-client');
const RedisEvents = require('ocbesbn-redis-events');
let rule = new schedule.RecurrenceRule();
rule.second = 0;
const { getSubscriber } = require("./redisConfig");

const PORT = process.env.EXTERNAL_PORT;
const HOST = process.env.EXTERNAL_HOST;

module.exports = function(app, db) {
  /*
     API to get list of workflow.
  */
  this.client = new ServiceClient({ consul : { host : 'consul' } });
  this.events = new RedisEvents({ consul : { host : 'consul' } });

  this.events.subscribe('user.updated', (userData) => {
    this.client.get('user', '/onboardingdata/'+userData.id).spread((onboardData, response) => {
      console.log(onboardData);
      if (onboardData
        && !(onboardData.campaignTool === 'opuscapitaonboarding')
        && onboardData.invitationCode) {
        db.models.CampaignContact.update({
          status: 'registered',
          userId: userData.id
        }, {
          where: {
            invitationCode: onboardData.invitationCode
          }
        });
      }
    }).catch((ignore) => {});
  });

  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));

  /*
     API to load onboarding page
   */
  app.get('/public/landingpage/:campaignId/:contactId', (req, res) => {
     const { campaignId, contactId } = req.params;

     db.models.Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) {
          return Promise.reject('Campaign not found');
        }
        else {
          return db.models.CampaignContact.findById(contactId).then((contact) => {
            if(!contact) {
              return Promise.reject('Contact not found');
            }
            else {

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
  app.get('/public/transition/:campaignId/:contactId', (req, res) => {
    const { campaignId, contactId } = req.params;

    db.models.Campaign.findById(campaignId)
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

    const generateInvitation = (req) => {
      return db.models.CampaignContact.findAll({
          where: {
            campaignId,
            status: 'queued'
          }
        }).then((contacts) => Promise.all(contacts.map(function (contact) {
          return req.ocbesbn.serviceClient.post('user', '/onboardingdata', contact)
            .spread((result) => {
              return contact.update({
                invitationCode: result.invitationCode
              })
            });
        })))
    };

    const queueCampaignContacts = () => db.models.CampaignContact.update({ status: 'queued' }, {
      where: {
        campaignId,
        status: 'new'
      }
    });

    db.models.Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) return Promise.reject();

        return campaign.update({ status: 'inprogress' })
          .then(() => queueCampaignContacts())
          .then(() => generateInvitation(req))
          .then(() => res.status(200).json(campaign))
      })
      .catch((err) => {
        console.log("err",err)
        res.status(500).json({message: 'Not able to start campaign.'})
      });
  });

  //Update campaign contact's transition state.
  const updateTransitionState = (campaignType, contactId, transitionState) => {
    return db.models.CampaignContact.findById(contactId).then((contact) => {
      const transitions = getPossibleTransitions('SupplierOnboarding', contact.dataValues.status);

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
      where: {
        status: 'queued'
      },
      raw: true,
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {
        let sender = "opuscapita_noreply";
        let subject = "NCC Svenska AB asking you to connect eInvoicing";
        updateTransitionState('SupplierOnboarding', contact.id, 'sending')
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
  }

  // Scheduler to send mails.
  schedule.scheduleJob(rule, () => sendMails(db));

  getSubscriber().then((subscriber) => {
    subscriber.on("message", (channel, message) => {
      const onboardingUser = JSON.parse(message);
      updateTransitionState('SupplierOnboarding', onboardingUser.contactId, onboardingUser.transition);
    });

    subscriber.subscribe("onboarding");
  });
};
