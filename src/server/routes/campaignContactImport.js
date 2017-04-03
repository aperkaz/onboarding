const _ = require('lodash');
const discoverSynonymFieldNames = require('../../utils/contactFieldSynonymsDiscovery');
/* eslint-disable no-param-reassign */

module.exports = function(app, db) {
  app.post('/api/campaigns/:campaignId/contacts/import', (req, res) => {
    let campaignId = req.params.campaignId;
    let importFieldMapping = discoverSynonymFieldNames(_.keys(req.body.contacts[0]));
    Promise.all(_.map(req.body.contacts, (contact) => {
      let contactInst = _.extend(_.mapKeys(contact, (value, key) => {
        return importFieldMapping[key];
      }), {
        campaignId: campaignId
      });
      return db.models.CampaignContact.findOne({
        where: {
          campaignId: contactInst.campaignId,
          email: contactInst.email
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
  });
};
