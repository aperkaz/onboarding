const _ = require('lodash');
const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const workflow = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;

module.exports = function(app, db) {
  
  /*
     API to get list of workflow.
  */
  app.get('/api/getWorkflowTypes', (req, res) => {
    let workFlowTypesList = workflow.getWorkflowTypes();
    res.status(200).json(workFlowTypesList)
  });

  app.get('/api/getContacts', (req, res) => {
    db.CampaignContact.findAll({
      where: {status: 'quoued'},
      raw: true,
    }).then((contacts) => {
      res.json(contacts);
    });
  });

  app.get('/api/getCampaign', (req, res) => {
    db.Campaign.findAll({
      raw: true,
    }).then((contacts) => {
      res.json(contacts);
    });
  });

  /*
    API to get list of Transitions.
  */
  app.get('/api/transition/:campaignId/:contactId', (req, res) => {
    db.Campaign.find({ where: {campaignId: req.params.campaignId}})
    .then(function(campaign){
      if(campaign){
        updateTransitionState(campaign.type, req.params.contactId, req.query.transition);
      }else{
        res.status(200).json({message: 'There is no campaign of id'+campaignId});
      }
      
    })
  });

  /*
    API to quoued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    db.sequelize.query("UPDATE CampaignContact SET status = 'quoued' WHERE campaignId = '"+req.params.campaignId+"'").spread(function(results, metadata) {
      res.status(200).json();
    });
  });
  
 

  //Get list of possible transitions.
  function getTransitions(campaignType, currentState){
    return workflow.getPossibleTransitions(campaignType, currentState);
  }
  
  //Update campaign contact's transition state. 
  function updateTransitionState(campaignId, id, transitionState) {
    db.CampaignContact.find({ where: {id: id} })
    .then(function (contact) {
      if(contact && getTransitions('OnboardingEmail', contact.dataValues.status).indexOf(transitionState)!== -1){
        contact.updateAttributes({
          status: transitionState
        }).then(function (contact) {
          console.log(contact);
        });
      }else{
        console.log('not possible');
      }
    });
  }
  

  //API to send campaign emails.
  function sendMails(){
    db.CampaignContact.findAll({
      where: {
        status: 'quoued'
      },
      raw: true,
    }).then((contacts) => {
      async.each(contacts, function(contact, callback) {  
      console.log(contact.email);  
        let sender = "Karan@cronj.com";
        let subject = "Test";
        let content = " Hello I am testing mailgun email APIs";
        sendEmail(sender, contact, subject, content, updateTransitionState, callback);                   
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

};

