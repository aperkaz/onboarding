// rest routes for campaigns
module.exports = function(epilogue, db) {
  epilogue.resource({
    model: db.Campaign,
    endpoints: [
      '/campaigns',
      '/campaigns/:campaignId'
    ]
  });
};
