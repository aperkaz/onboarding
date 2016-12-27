const _ = require('lodash');
const sendEmail = require('../../utils/emailIntegration');

module.exports = function(app, db) {
  app.get('/api/workflow/:campaignId', (req, res) => {
  	return db.CampaignContact.findAll({
            where: {
              campaignId: req.params.campaignId
            },
            raw: true,
          }).then((contacts) => {
            // eslint-disable-next-line no-param-reassign
            var emails = _.map(contacts, function(contact){
              return contact.email;
            });

            /*
              TODO
              According to campaign need to select the content, recipient  for emails and the .
            */
            
           /*
             This is static data for testing purpose
           */
            var sender = "Karan@cronj.com";
            var recipient = "kiran.kulkarni@cronj.com";
            var subject = "Test";
            var content = " Hello I am testing mailgun email APIs";

            sendEmail(sender, recipient, subject, content);         
            
        })
  });
};

