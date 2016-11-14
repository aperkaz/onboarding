//rest routes for campaign contacts
module.exports = function(epilogue, db) {
  epilogue.resource({
    model: db.CampaignContact,
    endpoints: [
      '/campaigns/:campaignId/contacts',
      '/campaigns/:campaignId/contacts/:email'
    ]
  });
};
