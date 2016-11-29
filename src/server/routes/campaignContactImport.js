const _ = require('lodash');
const synonyms = require('../../utils/comapignContactFieldSynonyms');

module.exports = function(app, db) {
  app.post('/api/campaigns/:campaignId/contacts/import', (req, res) => {
    let campaignId = req.params.campaignId;
    let importFieldMapping = discoverFiledNames(req.body.contacts[0]);
    Promise.all(_.map(req.body.contacts, (contact) => {
      let contactInst = _.extend(_.mapKeys(contact, (value, key) => {
          return importFieldMapping[key];
        }), {
          campaignId: campaignId
        }
      );
      return db.CampaignContact.upsert(contactInst, { validate: true }).then((created) => {
        return Promise.resolve({
          created: created,
          contact: contactInst
        })
      }).catch((err) => {
        return Promise.resolve({
          failed: true,
          contact: contactInst,
          errors: err.errors
        });
      })
    })).then((importStatistic) => {
      res.json(_.reduce(importStatistic, (statisticAccumulator, objectImportResult) => {
        if(objectImportResult.created === true) {
          statisticAccumulator.created ++;
        } else if(objectImportResult.created === false) {
          statisticAccumulator.updated ++;
        } else if(objectImportResult.failed) {
          statisticAccumulator.failed ++;
        }
        return statisticAccumulator;
      }, {created: 0, updated: 0, failed: 0}));
    })
  });
};

/**
 * Takes any object from import-collection (we presume that all objects in the collection have the same structure)
 * and returns object with a mapping <originalFieldName>:<importObjectFieldName>
 * @param contactEntry
 * @return {<originalFieldName>:<importObjectFieldName>}
 */
const discoverFiledNames = (contactEntry) => {
  return _.chain(contactEntry).keys().reduce((result, fieldName) => {
    let originalFieldName = _.findKey(synonyms, (fieldNameSynonyms) => {
      return _.indexOf(fieldNameSynonyms, fieldName) !== -1;
    });
    if (!_.isUndefined(originalFieldName)) {
      result[fieldName] = originalFieldName;
    }
    return result;
  }, {}).value();
};
