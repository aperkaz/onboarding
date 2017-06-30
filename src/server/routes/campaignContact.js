module.exports = function(epilogue, db) {
  const campaignContactResource = epilogue.resource({
    model: db.models.CampaignContact,
    endpoints: [
      '/campaigns/:campaignId/contacts',
      '/campaigns/:campaignId/contacts/:email'
    ]
  });

  campaignContactResource.use({
    list: {
      fetch: {
        before: function(req, res, context) {
          const userData = req.opuscapita.userData();

          db.models.Campaign.findOne({
            where: {
              campaignId: req.params.campaignId,
              customerId: userData.customerid
            }
          }).then((campaign) => {
            return db.models.CampaignContact.findAll({
              where: {
                campaignId: campaign.id
              }
            })
          }).then((contacts) => {
            // eslint-disable-next-line no-param-reassign
            context.instance = contacts;
            context.skip();
          })
        }
      }
    },
    create: {
      fetch: function(req, res, context) {
        const userData = req.opuscapita.userData();
        if (!userData || !userData.customerid) {
          throw ForbiddenError;
        } else {
          return new Promise(
            function(resolve, reject) {
              db.models.Campaign.findOne({
              where: {
                campaignId: req.params.campaignId,
                customerId: userData.customerid
              }
            }).then((campaign) => {
              req.body.campaignId = campaign.id;
              resolve(context.continue);
            })
          });
        }
      }
    }
  });
};
