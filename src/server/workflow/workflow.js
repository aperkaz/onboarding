const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;

module.exports = function(app, db) {
  // Update campaign contact's transition state.
  const updateTransitionState = (campaignId, contactId, transitionState) => {
    console.log('---campaignId---->', campaignId);

    return db.CampaignContact.findById(contactId).then((contact) => {
      const transitions = getPossibleTransitions('SupplierOnboarding', contact.dataValues.status);

      if (contact && transitions.indexOf(transitionState) !== -1) {
        return contact.updateAttributes({
          status: transitionState
        });
      }

      return Promise.reject('Not possible to update transition.');
    });
  };

  /*
     API to get list of workflow.
  */
  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));

  app.post('/api/campaigns/start', (req, res) => {
    const query = "UPDATE Campaign SET status = 'new' WHERE campaignId = 'testNew'";

    db.sequelize.query(query).spread((results, metadata) => res.status(200).json(results));
  });

  /* app.get('/api/getContacts', (req, res) => {
    db.CampaignContact.findAll({
      where: {status: 'read'},
      raw: true,
    }).then((contacts) => {
      res.json(contacts);
    });
  });*/

  /*
    API to update the status of transition.
  */
  app.get('/api/transition/:campaignId/:contactId', (req, res) => {
    const { campaignId, contactId } = req.params;

    db.Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) return Promise.reject();

        return updateTransitionState(campaign.type, contactId, req.query.transition)
          .then((result) => res.status(200).json({ campaign: campaign.dataValues, contact: result.dataValues }))
          .catch(() => res.status(500).json({ message: 'Not able to update Transition status.' }));
      })
      .catch(() => res.status(500).json({ message: 'There is no campaign of id' }))
  });

  /*
   API to add onboard User's details.
  */
  app.post('/api/onboarding', (req, res) => {
    const { campaignId, contactId, transition } = req.body;

    updateTransitionState(campaignId, contactId, transition)
      .then(() => res.status(200).json({}))
      .catch(() => res.status(500).json({}));
  });

  /*
    API to queued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    const { campaignId } = req.params;

    const queueCampaignContacts = () => db.CampaignContact.update({ status: 'queued' }, {
      where: {
        campaignId,
        status: 'new'
      }
    });

    db.Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) return Promise.reject();

        return campaign.update({ status: 'inprogress' })
          .then(() => queueCampaignContacts())
          .then(() => res.status(200).json(campaign))
      })
      .catch(() => res.status(500).json({ message: 'Not able to start campaign.' }));
  });

  // API to send campaign emails.
  const sendMails = () => {
    db.CampaignContact.findAll({
      where: {
        status: 'queued'
      },
      raw: true
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {
        const sender = "opuscapita_noreply";
        const subject = "NCC Svenska AB asking you to connect eInvoicing";

        sendEmail(sender, contact, subject, updateTransitionState, callback);
      }, function(err) {
        if (err) {
          console.log('Not able to mail this --', err);
        } else {
          console.log('DONE');
        }
      });
    });
  };

  // Scheduler to send mails.
  schedule.scheduleJob(rule, () => sendMails(db));
};

