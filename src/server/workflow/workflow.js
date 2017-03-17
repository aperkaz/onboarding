const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const workflowType = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;

module.exports = function(app, db) {
  // Get list of possible transitions.
  const getTransitions = (campaignType, currentState) => {
    return workflowType.getPossibleTransitions(campaignType, currentState);
  }

  // Update campaign contact's transition state.
  const updateTransitionState = (campaignId, id, transitionState) => {
    console.log('---campaignId---->', campaignId);
    return db.CampaignContact.find({ where: { id: id } }).then((contact) => {
      if (contact && getTransitions('SupplierOnboarding', contact.dataValues.status).indexOf(transitionState) !== -1) {
        return contact.updateAttributes({
          status: transitionState
        }).then((contact) => {
          return contact;
        });
      } else {
        return Promise.reject('Not possible to update transition.');
      }
    });
  }


  /*
     API to get list of workflow.
  */
  app.get('/api/getWorkflowTypes', (req, res) => {
    const workFlowTypesList = workflowType.getWorkflowTypes();

    res.status(200).json(workFlowTypesList)
  });

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
    db.Campaign.find({ where: { campaignId: req.params.campaignId } }).
    then((campaign) => {
      if (campaign) {
        updateTransitionState(campaign.type, req.params.contactId, req.query.transition).
        then((result) => {
          res.status(200).json({ campaign: campaign.dataValues, contact: result.dataValues });
        }).catch((error) => {
          res.status(500).json({ message: 'Not able to update Transition status.' });
        })
      } else {
        res.status(500).json({ message: 'There is no campaign of id' });
      }
    })
  });

  /*
   API to add onboard User's details.
  */
  app.post('/api/onboarding', (req, res) => {
    updateTransitionState(req.body.campaignId, req.body.contactId, req.body.transition)
      .then(() => res.status(200).json({}))
      .catch(() => res.status(500).json({}));
  });

  /*
    API to quoued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    const { campaignId } = req.params;

    db.Campaign.update({ status: 'inprogress' }, { where: { campaignId }})
      .then((data) => {
        return db.CampaignContact.update({ status: 'queued' }, {
          where: {
            campaignId,
            status: 'new'
          }
        })
        .then(() => res.status(200).json(data.dataValues));
      })
      .catch(() => res.status(500).json({ message: 'Not able to start campaign.' }));
  });


  // API to send campaign emails.
  let sendMails = () => {
    db.CampaignContact.findAll({
      where: {
        status: 'queued'
      },
      raw: true,
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
  }

  // Scheduler to send mails.
  schedule.scheduleJob(rule, function() {
    sendMails();
  });
};

