const _ = require('lodash');
const CAMPAIGN_SEARCH_FIELDS = ['campaignId', 'status', 'campaignType'];

const getCampaignSearchFieldsQuery = (requestQuery, fields) => {
  const query = {};

  _.each(fields, (searchField) => {
    if (!_.isEmpty(requestQuery[searchField])) {
      query[searchField] = {
        $like: `%${query[searchField]}%`
      }
    }
  });

  return query;
};

const getCurrentUserCampaignsQuery = (userData) => {
  if (_.includes(userData.roles, 'xtenant')) {
    return null;
  }

  if (!_.isEmpty(userData.customerid)) {
    return { customerId: userData.customerid };
  }

  // workaround to don't display any Campaigns for Users with no customerid
  return { customerId: '' };
};

const getDateQuery = (requestQuery, paramName) => {
  if (!_.isUndefined(requestQuery[paramName]) && !_.isNaN(Date.parse(requestQuery[paramName]))) {
    return {
      [paramName]: {
        $lte: new Date(query[paramName])
      }
    };
  }

  return null;
};

module.exports = (epilogue, db) => {
  /**
   * APIs for Campaign Information.
   * @class workflow
   */

  epilogue.resource({
    model: db.models.Campaign,
    endpoints: [
      '/campaigns',
      '/campaigns/:campaignId'
    ]
  }).use({
    list: {
      fetch: {
        before: function(req, res, context) {
          const { query } = req;
          const userData = req.ocbesbn.userData();
          const currentUserCampaignsQuery = getCurrentUserCampaignsQuery(userData);
          const campaignSearchFieldsQuery = getCampaignSearchFieldsQuery(query, CAMPAIGN_SEARCH_FIELDS);
          const startsOnQuery = getDateQuery(query, 'startsOn');
          const endsOnQuery = getDateQuery(query, 'endsOn');

          const searchQuery = _.merge(
            {},
            currentUserCampaignsQuery,
            campaignSearchFieldsQuery,
            startsOnQuery,
            endsOnQuery
          );

          db.models.Campaign
            .findAll({ where: searchQuery })
            .then((campaigns) => {
              // eslint-disable-next-line no-param-reassign
              context.instance = campaigns;
              context.skip();
            })
        }
      }
    }
  });
};

module.exports.getCampaignSearchFieldsQuery = getCampaignSearchFieldsQuery;
module.exports.getCurrentUserCampaignsQuery = getCurrentUserCampaignsQuery;
module.exports.getDateQuery = getDateQuery;
