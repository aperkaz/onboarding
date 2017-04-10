const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;
const { getSubscriber } = require("./redisConfig");

module.exports = function(app, db) {
  /*
     API to get list of workflow.
  */
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
                const userDetail = {
                  contactId : contact.contactId,
                  email: contact.email,
                  firstName: contact.contactFirstName,
                  lastName: contact.contactLastName,
                  campaignId: campaign.campaignId,
                  serviceName: 'eInvoiceSend'
                };
                const tradingPartnerDetails = {
                  name: 'NCC Svenska AB',
                  vatIdentNo: contact.vatIdentNo,
                  taxIdentNo: contact.taxIdentNo,
                  dunsNo: contact.dunsNo,
                  commercialRegisterNo: contact.commercialRegisterNo,
                  city: contact.city,
                  country: contact.country
                }
                let fwdUri = '/onboarding/public/ncc_onboard?userDetail=' + JSON.stringify(userDetail) + '&tradingPartnerDetails=' + JSON.stringify(tradingPartnerDetails)
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
            var contact = result.dataValues;
            console.log("updated transition to: " + req.query.transition);
            res.status(200).json({ message: 'OK - Transition updated successfully' })
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
          .then(() => res.status(200).json(campaign))
      })
      .catch(() => res.status(500).json({ message: 'Not able to start campaign.' }));
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
        .then((result) => {
          sendEmail(sender, contact, subject, updateTransitionState, callback);
        }).catch((error) => {
          console.log(error);
        });
        //sendEmail(sender, contact, subject, updateTransitionState, callback);
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
