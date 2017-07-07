const _ = require('lodash');
const util = require('util');

const discoverSynonymFieldNames = require('../../utils/contactFieldSynonymsDiscovery');
/* eslint-disable no-param-reassign */

module.exports = function(app, db) {
  app.post('/api/campaigns/:campaignId/contacts/import', (req, res) => {
    let campaignId = req.params.campaignId;
    let customerId = req.opuscapita.userData('customerId');
    
    let importFieldMapping = discoverSynonymFieldNames(_.keys(req.body.contacts[0]));
    console.log(util.inspect(req.body.contacts, {depth:null}));
    return db.models.Campaign.findOne({
      where: {
        campaignId: campaignId,
        customerId: customerId
      }
    }).then( (campaign) => {
      return Promise.all(_.map(req.body.contacts, (contact) => {
        let contactInst = _.extend(_.mapKeys(contact, (value, key) => {
          return importFieldMapping[key];
        }), {
          campaignId: campaignId
        });
        return db.models.CampaignContact.findOne({
          where: {
            campaignId: campaign.id,
            email: contactInst.email // match by email -> improve to use match by vatIdentNo, dunsNo
          }
        }).then((foundEntry) => {
          if (!_.isNull(foundEntry)) {
            return foundEntry.update(contactInst).then((updatedInstance) => {
              return Promise.resolve({ updated: true });
            })
          } else {
            return db.models.CampaignContact.create(contactInst).then((createdInstance) => {
              return Promise.resolve({ created: true });
            })
          }
        }).catch((err) => {
          return Promise.resolve({
            failed: true
          });
        })
      })).then((importStatistic) => {
        res.json(_.reduce(importStatistic, (statisticAccumulator, objectImportResult) => {
          if (objectImportResult.created) {
            statisticAccumulator.created++;
          } else if (objectImportResult.updated) {
            statisticAccumulator.updated++;
          } else if (objectImportResult.failed) {
            statisticAccumulator.failed++;
          }
          return statisticAccumulator;
        }, { created: 0, updated: 0, failed: 0 }));
      })
    })
  });
};
