const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;
const redis = require("redis");
const subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

subscriber.auth(process.env.REDIS_AUTH, function (err) {
  if (err) throw err;
});

module.exports = function(app, db) {
  /*
     API to get list of workflow.
  */
  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));

  /*
    API to update the status of transition.
  */
  app.get('/api/transition/:campaignId/:contactId', (req, res) => {
    const { campaignId, contactId } = req.params;

    db.models.Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) return Promise.reject();

        return updateTransitionState(campaign.type, contactId, req.query.transition)
          .then((result) => res.status(200).json({ campaign: campaign.dataValues, contact: result.dataValues }))
          .catch(() => res.status(500).json({ message: 'Not able to update Transition status.' }));
      })
      .catch(() => res.status(500).json({ message: 'There is no campaign of id' }))
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

  subscriber.on("message", (channel, message) => {
    const onboardingUser = JSON.parse(message);
    updateTransitionState('SupplierOnboarding', onboardingUser.contactId, onboardingUser.transition);
  });

  subscriber.subscribe("onboarding");
};