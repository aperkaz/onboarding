const _ = require('lodash');
const Sequelize = require('sequelize');
const CAMPAIGN_SEARCH_FIELDS = ['campaignId', 'status', 'campaignType'];
var ForbiddenError = require('epilogue').Errors.ForbiddenError;

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

module.exports = (app, epilogue, db) => {
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
          const userData = req.opuscapita.userData();
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
    },
    create: {
      fetch: function(req, res, context) {
        const userData = req.opuscapita.userData();
        console.log(userData);
        if (!userData || !userData.customerid) {
          throw ForbiddenError;
        } else {
          req.body.customerId = userData.customerid;
        }
        return context.continue;
      }
    }
  });

  app.get('/campaigns/:companyId([1-9][0-9]{0,})', (req, res) => {
    let subquery = db.dialect.QueryGenerator.selectQuery('Campaign', {
      attributes: ['campaignId'],
      where: {
        companyId: req.params.companyId
      }
    })
    .slice(0,-1);

    let results = db.models.CampaignContact.findAll({
      attributes: ["campaignId", "status", [db.fn('count', db.col('status')), 'statusCount']],
      where: {
        campaignId: { 
          $in: db.literal('(' + subquery+ ')')
        }
      },
      group: ["campaignId", "status"]
    }).then((data) => {
      res.status(200).json(data);
    });
  })
};

module.exports.getCampaignSearchFieldsQuery = getCampaignSearchFieldsQuery;
module.exports.getCurrentUserCampaignsQuery = getCurrentUserCampaignsQuery;
module.exports.getDateQuery = getDateQuery;
