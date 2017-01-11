const _ = require('lodash');
const async = require('async');
const sendEmail = require('../../utils/emailIntegration');
const workflowType = require('../../utils/workflowConstant');
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = 0;

module.exports = function(app, db) {
  
  /*
     API to get list of workflow.
  */
  app.get('/api/getWorkflowTypes', (req, res) => {
    let workFlowTypesList = workflowType.getWorkflowTypes();
    res.status(200).json(workFlowTypesList)
  });

  app.post('/api/campaigns/start', (req, res) => {
      db.sequelize.query("UPDATE Campaign SET status = 'new' WHERE campaignId = 'OnBoardingCampaign'").spread( (results, metadata) => {
        res.status(200).json(results);
      })
  });

  /*app.get('/api/getContacts', (req, res) => {
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
    db.Campaign.find({ where: {campaignId: req.params.campaignId}})
    .then((campaign) =>{
      if(campaign){
        updateTransitionState(campaign.type, req.params.contactId, req.query.transition)
        .then((result) => {
          res.status(200).json({message: 'Transition status updated.'});
        }).catch((error) => {
          res.status(500).json({message: 'Not able to update Transition status.'});
        })
      }else{
        res.status(500).json({message: 'There is no campaign of id'+campaignId});
      }
      
    })
  });

  /*
   API to add onboard User's details.
  */
  app.post('/api/onboarding', (req, res) => {
    updateTransitionState(req.body.campaignId, req.body.contactId, req.body.transition)
    .then((result) => {
      res.status(200).json({});
    }).catch((error) => {
      res.status(500).json({});
    })
  });

  /*
    API to quoued the list of contacts belogs to campaign.
  */
  app.put('/api/campaigns/start/:campaignId', (req, res) => {
    updateCampaignStatus(req.params.campaignId, 'inprogress').then((data) =>{
      db.sequelize.query("UPDATE CampaignContact SET status = 'quoued' WHERE campaignId = '"+req.params.campaignId+"'").spread( (results, metadata) => {
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
  let getTransitions = (campaignType, currentState) => {
    return workflowType.getPossibleTransitions(campaignType, currentState);
  }
  
  //Update campaign contact's transition state. 
  let updateTransitionState  = (campaignId, id, transitionState) => {
    return db.CampaignContact.find({ where: {id: id} })
    .then((contact) => {
      if(contact && getTransitions('OnboardingEmail', contact.dataValues.status).indexOf(transitionState)!== -1){
        return contact.updateAttributes({
          status: transitionState
        }).then((contact) => {
          return contact;
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
        status: 'quoued'
      },
      raw: true,
    }).then((contacts) => {
      async.each(contacts, (contact, callback) => {  
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

