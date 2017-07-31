const _ = require('lodash');
const Sequelize = require('sequelize');
const CAMPAIGN_SEARCH_FIELDS = ['campaignId', 'status', 'campaignType'];
var ForbiddenError = require('epilogue').Errors.ForbiddenError;
const ServiceClient = require('ocbesbn-service-client');

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

module.exports = (app, epilogue, db) =>
{
  const CAMPAIGNTOOLNAME = "opuscapitaonboarding";
  this.client = new ServiceClient({ consul : { host : 'consul' } });

  app.get('/api/campaigns', (req, res) =>
  {
      const customerId = req.opuscapita.userData('customerId');
      const currentUserCampaignsQuery = customerId && { customerId : customerId };
      const campaignSearchFieldsQuery = getCampaignSearchFieldsQuery(req.query, CAMPAIGN_SEARCH_FIELDS);
      const startsOnQuery = getDateQuery(req.query, 'startsOn');
      const endsOnQuery = getDateQuery(req.query, 'endsOn');

      const searchQuery = _.merge({ }, currentUserCampaignsQuery,
          campaignSearchFieldsQuery, startsOnQuery, endsOnQuery);

      db.models.Campaign.findAll({ where: searchQuery })
      .then((campaigns) => res.json(campaigns))
      .catch(e => res.status(400).json({ message: e.message }))
  });

   app.post('/api/campaigns', (req, res) =>
   {
       const customerId = req.opuscapita.userData('customerId') || 'ncc';

       if(customerId)
       {
          req.body.customerId = customerId;
          req.body.invitationCode = req.body.invitationCode || null;
          db.models.Campaign.create(req.body)
            .then( campaign => {
              if (campaign.invitationCode) {
                let data = {
                  campaignDetails: {
                    id : (campaign.id),
                    campaignId : (campaign.campaignId)
                  }
                }
                data.campaignDetails = JSON.stringify(data.campaignDetails); // Missing conversion in user updateByInvitationCode
                return this.client.put('user', `/onboardingdata/${campaign.invitationCode}`, data, true);
              }
              return Promise.resolve(campaign);
            })
            .then(() => res.json(req.body)).catch(e => res.status(400).json({ message: e.message }));
       }
       else
       {
           res.status(401).json({ message: 'You are not allowed to take these action.' });
       }
   });

   app.get('/api/campaigns/:campaignId', (req, res) =>
   {
       const customerId = req.opuscapita.userData('customerId') || 'ncc';

       db.models.Campaign.findOne({ campaignId : req.params.campaignId })
          .then(campaign => res.json(campaign)).catch(e => res.status(400).json({ message: e.message }));
   });

   app.put('/api/campaigns/:campaignId', (req, res) =>
   {
       const customerId = req.opuscapita.userData('customerId') || 'ncc';

       if(customerId)
       {
           const where = { where : { campaignId : req.params.campaignId } };

           req.body.customerId = customerId;
           db.models.Campaign.update(req.body, where)
              .then(() => res.json(req.body)).catch(e => res.status(400).json({ message: e.message }));
       }
       else
       {
           res.status(401).json({ message: 'You are not allowed to take these action.' });
       }
   });

  app.delete('/api/campaigns/:campaignId', (req, res) =>
  {
      const customerId = req.opuscapita.userData('customerId') || 'ncc';

      if(customerId)
      {
          const where = { where : { campaignId : req.params.campaignId } };
          db.models.Campaign.destroy(where)
            .then(() => res.json(true)).catch(e => res.status(400).json({ message: e.message }));
      }
      else
      {
          res.status(401).json({ message: 'You are not allowed to take these action.' });
      }
  });

  app.get('/api/campaigns/:campaignId/users', (req, res) => {
    return db.models.CampaignContact.findAll({ where: { campaignId: req.params.campaignId } }).then(contacts => {
      const userIds = contacts.reduce((ids, contact) => {
        if (contact.userId) ids.push(contact.userId);
        return ids;
      }, []).join(',');
      return req.opuscapita.serviceClient.get('user', `/users?ids=${userIds}&include=profile`, true).
        spread(users => res.json(users)).
        catch(error => res.status(error.response.statusCode || 400).json({ message : error.message }));
    });
  });

  app.get('/api/campaigns/:campaignId/inchannelContacts', (req, res) => {
    const customerId = req.opuscapita.userData('customerId');
    const supplierIdsQuery = Array.isArray(req.query.supplierIds) ? req.query.supplierIds.join('&supplierIds=') : req.query.supplierIds;
    const queryParams = 'supplierIds=' + supplierIdsQuery;
    return req.opuscapita.serviceClient.get('einvoice-send', `/api/config/inchannelcontracts/c_${customerId}?${queryParams}`).
      spread(contracts => res.json(contracts)).
      catch(error => res.status(error.response.statusCode || 400).json({ message : error.message }));
  });

  app.get('/api/stats/campaigns', (req, res) => {
    let customerId = req.opuscapita.userData('customerId');
    let subquery = db.dialect.QueryGenerator.selectQuery('Campaign', {
      attributes: ['id'],
      where: {
        customerId: customerId
      }
    })
    .slice(0,-1);

    console.log(subquery);

    let results = db.models.CampaignContact.findAll({
      attributes: ["status", [db.fn('count', db.col('status')), 'statusCount'], [
        db.literal("("+db.dialect.QueryGenerator.selectQuery('Campaign', {
          attributes: ['campaignId'],
            where: {
              id: {
                $eq: db.literal('`CampaignContact`.`campaignId`')
              }
            }
        }).slice(0,-1)+")"),
        "campaignId"]],
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

  app.get('/api/campaigns/create/getInvitationCode', (req, res) =>
  {
    let data = {
      type: 'multipleUse',
      campaignTool: CAMPAIGNTOOLNAME,
      userDetails: {},
      tradingPartnerDetails: {},
      campaignDetails: {}
    }
    this.client.post('user', '/onboardingdata', data, true)
    .then(result => {
      res.status(200).json(result);
    });
    // res.status(200).json({ code: "middleware test code" });
  });
};

module.exports.getCampaignSearchFieldsQuery = getCampaignSearchFieldsQuery;
module.exports.getCurrentUserCampaignsQuery = getCurrentUserCampaignsQuery;
module.exports.getDateQuery = getDateQuery;
