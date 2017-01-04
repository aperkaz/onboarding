// rest routes for campaigns
const _ = require('lodash');
const campaignSearchFields = ['campaignId', 'status', 'campaignType', 'owner'];

module.exports = function(epilogue, db) {
  epilogue.resource({
    model: db.Campaign,
    endpoints: [
      '/campaigns',
      '/campaigns/:campaignId'
    ]
  }).use({
    list: {
      fetch: {
        before: function(req, res, context) {
          let searchQuery = {};
          _.each(campaignSearchFields, (searchField) => {
            if(!_.isEmpty(req.query[searchField])) {
              searchQuery[searchField] = {
                $like: `%${req.query[searchField]}%`
              }
            }
          });
          if(!_.isUndefined(req.query.startsOn) && !_.isNaN(Date.parse(req.query.startsOn))) {
            searchQuery.startsOn = {
              $gte: new Date(req.query.startsOn)
            }
          }
          if(!_.isUndefined(req.query.endsOn) && !_.isNaN(Date.parse(req.query.endsOn))) {
            searchQuery.endsOn = {
              $lte: new Date(req.query.endsOn)
            }
          }
          db.Campaign.findAll({
            where: searchQuery
          }).then((campaigns) => {
            // eslint-disable-next-line no-param-reassign
            context.instance = campaigns;
            context.skip();
          })
        }
      }
    }
  });
};
