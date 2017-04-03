const _ = require('lodash');
const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const { getPossibleTransitions, getWorkflowTypes } = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
const redis = require("redis");
const subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
let rule = new schedule.RecurrenceRule();
rule.second = 0;

subscriber.auth(process.env.REDIS_AUTH, function (err) {
  if (err) throw err;
});
module.exports = function(app, db) {
  /**
     * APIs for Campaign onboarding flow.
     * @class workflow
     */

  /**
     * APIs for qdasdasdas onboarding flow.
     * @class '/api/getWorkflowTypes'
     */
  app.get('/api/getWorkflowTypes', (req, res) => res.status(200).json(getWorkflowTypes()));


  /*
    API to update the status of transition.
  */
  app.get('/api/transition/:campaignId/:contactId', (req, res) => {
    db.Campaign.find({ where: {campaignId: req.params.campaignId}})
    .then((campaign) => {
      if(campaign){
        updateTransitionState(campaign.type, req.params.contactId, req.query.transition)
        .then((result) => {
          res.status(200).json({campaign: campaign.dataValues, contact: result.dataValues});
        }).catch((error) => {
          res.status(500).json({message: 'Not able to update Transition status.'});
        })
      }else{
        res.status(500).json({message: 'There is no campaign of id'});
      }

    })
  });


  /*
    API to quoued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    updateCampaignStatus(req.params.campaignId, 'inprogress').then((data) =>{
      db.sequelize.query("UPDATE CampaignContact SET status = 'queued', lastStatusChange = NOW() WHERE campaignId = '"+req.params.campaignId+"'").spread( (results, metadata) => {
        res.status(200).json(data.dataValues);
      })
    }).catch((error) => {
      res.status(500).json({message: 'Not able to start campaign.'});
    })
    ;
  });


  //To update Campaign Status.
  let updateCampaignStatus = (campaignId, status) => {
    return db.Campaign.find({ where: {campaignId: campaignId}})
    .then((campaign) => {
      return campaign.updateAttributes({
        status: status
      }).then((campaign) => {
          return campaign;
      }).catch((error) => {
        return error;
      })
    })
    .catch((error) => {
      return error;
    })
  }

  //Get list of possible transitions.
  let getTransitions = (campaignType, currentState) => getPossibleTransitions(campaignType, currentState);

  
  //Update campaign contact's transition state.
  let updateTransitionState  = (campaignId, id, transitionState) => {
    return db.CampaignContact.find({ where: {id: id} })
    .then((contact) => {
      if(contact && getTransitions('SupplierOnboarding', contact.dataValues.status).indexOf(transitionState)!== -1){
        return contact.updateAttributes({
          status: transitionState,
          lastStatusChange: new Date()
        }).then((contact) => {
          return contact;
        }).catch((error) => {
          console.log('-----error----', error);
        });
      }else{
        return Promise.reject('Not possible to update transition.');
      }
    });
  }


  //API to send campaign emails.
  let sendMails = () => {
    db.CampaignContact.findAll({
      where: {
        status: 'queued'
      },
      raw: true,
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {
        let sender = "opuscapita_noreply";
        let subject = "NCC Svenska AB asking you to connect eInvoicing";
        updateTransitionState(contact.campaignId, contact.id, 'sending')
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

  //Scheduler to send mails.
  schedule.scheduleJob(rule, function(){
    sendMails();
  });


  subscriber.on("message", function(channel, message) {
    let onboardingUser = JSON.parse(message);
    updateTransitionState(onboardingUser.campaignId, onboardingUser.contactId, onboardingUser.transition);
  });

  subscriber.subscribe("onboarding");

};
