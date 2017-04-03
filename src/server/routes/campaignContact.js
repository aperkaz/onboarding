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
          db.models.CampaignContact.findAll({
            where: {
              campaignId: req.params.campaignId
            }
          }).then((contacts) => {
            // eslint-disable-next-line no-param-reassign
            context.instance = contacts;
            context.skip();
          })
        }
      }
    }
  });
};
