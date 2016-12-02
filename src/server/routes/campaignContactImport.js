const _ = require('lodash');
const synonyms = require('../../utils/comapignContactFieldSynonyms');
/* eslint-disable no-param-reassign */

/**
 * Takes any object from import-collection (we presume that all objects in the collection have the same structure)
 * and returns object with a mapping <importObjectFieldName>: <originalFieldName>
 * @param contactEntry
 * @return {<importObjectFieldName>: <originalFieldName>}
 */
const discoverFiledNames = (contactEntry) => {
  return _.chain(contactEntry).keys().reduce((result, fieldName) => {
    let originalFieldName = _.findKey(synonyms, (fieldNameSynonyms) => {
      return _.findIndex(fieldNameSynonyms, (synonym) => {
        return synonym.toLowerCase() === fieldName.toLowerCase()
      }) !== -1;
    });
    if (!_.isUndefined(originalFieldName)) {
      result[fieldName] = originalFieldName;
    }
    return result;
  }, {}).value();
};

module.exports = function(app, db) {
  app.post('/api/campaigns/:campaignId/contacts/import', (req, res) => {
    let campaignId = req.params.campaignId;
    let importFieldMapping = discoverFiledNames(req.body.contacts[0]);
    Promise.all(_.map(req.body.contacts, (contact) => {
      let contactInst = _.extend(_.mapKeys(contact, (value, key) => {
        return importFieldMapping[key];
      }), {
        campaignId: campaignId
      });
      return db.CampaignContact.findOne({
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
          return db.CampaignContact.create(contactInst).then((createdInstance) => {
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
