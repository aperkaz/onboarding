const _ = require('lodash');
const util = require('util');

const synonymsDiscovery = require('../../utils/contactFieldSynonymsDiscovery');
/* eslint-disable no-param-reassign */

module.exports = function(app, db) {
  app.post('/api/campaigns/:campaignId/contacts/import', (req, res) => {
    let campaignId = req.params.campaignId;
    let customerId = req.opuscapita.userData('customerId');

    let synonyms = {}
    for( var sk in synonymsDiscovery.campaignContactFieldSynonyms) {
      synonyms[sk] = synonymsDiscovery.campaignContactFieldSynonyms[sk].map( synonym => {return synonym.toLowerCase()});
    }
    let importFieldMapping = {}; //we will add missing columns while iterating contacts to make sure we also capture columns that have empty values in first rows
    //console.log(util.inspect(req.body.contacts, {depth:null}));

    // lets create some luts
    let importContactsByEmail = {};
    let importContactsByVatid = {};
    let importContactsByDunsNo = {};
    let importContactsByCustomerSupplierId = {};

    let findTargetFieldName = (sourceColumnName) => {
      for(var targetFieldName in synonyms) {
        targetFieldSynonyms = synonyms[targetFieldName];
        if(targetFieldSynonyms.indexOf(sourceColumnName) > -1) {
          console.log("found mapping for column " + sourceColumnName + " -> " + targetFieldName);
          return targetFieldName;
        }
      }
      console.log("missing mapping for column " + sourceColumnName );
      return '';
    };

    let mappedContacts = []

    return db.models.Campaign.findOne({
      where: {
        campaignId: campaignId,
        customerId: customerId
      }
    })
    .then( (campaign) => {
      req.body.contacts.forEach( contact => {
        let mappedContact = {}
        Object.keys(contact).forEach(ck => {
          let targetFieldName = importFieldMapping[ck];
          if( ! targetFieldName && targetFieldName != '') {
            targetFieldName = findTargetFieldName(ck.toLowerCase());
            importFieldMapping[ck] = targetFieldName;
            //console.log("added mapping for column " + ck + " -> " + targetFieldName + ", mapping now " + util.inspect(importFieldMapping));
          }
          if(targetFieldName && targetFieldName != '') mappedContact[targetFieldName] = contact[ck];
        })
        mappedContact.campaignId = campaign.id;
        mappedContact.status = 'new';
        //console.log("mapped contact " + util.inspect(contact) + " to " + util.inspect(mappedContact) + ", req.params = " + util.inspect(req.params));
        mappedContacts.push(mappedContact);

        if(mappedContact.email) {
          importContactsByEmail[mappedContact.email.toLowerCase()] = mappedContact;
          // console.log("adding " + mappedContact.email.toLowerCase() + " -> " + util.inspect(mappedContact) + " to importContactsByEmail ");
        }
        if(mappedContact.vatIdentNo) {
          importContactsByVatid[mappedContact.vatIdentNo.toLowerCase()] = mappedContact;
          // console.log("adding " + mappedContact.vatIdentNo.toLowerCase() + " -> " + util.inspect(mappedContact) + " to importContactsByVatid ");
        }
        if(mappedContact.dunsNo){
          importContactsByDunsNo[mappedContact.dunsNo] = mappedContact;
          // console.log("adding " + mappedContact.dunsNo + " -> " + util.inspect(mappedContact) + " to importContactsBydunsNo ");
        }
        if (mappedContact.customerSupplierId) {
          importContactsByCustomerSupplierId[mappedContact.customerSupplierId] = mappedContact;
          // console.log("adding " + mappedContact.customerSupplierId + " to importContactsByCustomerSupplierId");
        }
      });

      //let's get all contacts in the campaign and filter by a custom condition
      return db.models.CampaignContact.findAll({
        where: {
          campaignId: campaign.id
        }
      })
      .then( contacts => {
        return Promise.resolve(contacts.filter( (contact) =>
        {
            let matchingContact = contact.email && importContactsByEmail[contact.email.toLowerCase()];
            if (matchingContact) {
              matchingContact.match = contact;
              //console.log("db contact " + util.inspect(contact) + " matched to import contact " + util.inspect(matchingContact) + " via email");
              return contact;
            }
            matchingContact = contact.vatIdentNo && importContactsByVatid[contact.vatIdentNo.toLowerCase()];
            if (matchingContact) {
              matchingContact.match = contact;
              // console.log("db contact " + util.inspect(contact) + " matched to import contact " + util.inspect(matchingContact) + " via vatIdentNo");
              return contact;
            }
            matchingContact = importContactsByDunsNo[contact.dunsNo];
            if (matchingContact) {
              matchingContact.match = contact;
              // console.log("db contact " + util.inspect(contact) + " matched to import contact " + util.inspect(matchingContact) + " via dunsNo");
              return contact;
            }
            matchingContact = importContactsByCustomerSupplierId[contact.customerSupplierId];
            if (matchingContact) {
              matchingContact.match = contact;
              // console.log("Matched Contact for customerSuppierId: " + contact.customerSupplierId);
              return contact;
            }

            return null;
        }))
      })
      .then( (matchedContacts) => {
        //console.log("contacts in db that have matching contacts in import = " + util.inspect(matchedContacts));
        //console.log("importContacts after matching = " + util.inspect(mappedContacts));
        return Promise.resolve(null);
      }).then( (ignore) => {
        // now we can iterate import contacts and either insert or update the matching db contacts
        console.log("going to insert/update " + mappedContacts.length + " contacts...");
        return Promise.all(mappedContacts.map( (mc, index)  => {
          //console.log("Processing import row " + index);
          if (mc.match) {
            return mc.match.update(mc)
            .then((updatedInstance) => {
              return Promise.resolve({ updated: true });
            })
            .catch(err => {
              let errMsg = "failed to update contact " + util.inspect(mc) + ": " + err;
              console.log(errMsg);
              return Promise.resolve({failed:true, line:index, error:errMsg});
            })
          } else {
            return db.models.CampaignContact.create(mc)
            .then((createdInstance) => {
              return Promise.resolve({ created: true });
            })
            .catch(err => {
              let errMsg = "failed to insert contact " + util.inspect(mc) + ": " + err;
              console.log(errMsg);
              return Promise.resolve({failed:true, line:index, error:errMsg});
            })
          }
        }))
        .then((importStatistic) => {
          res.json(_.reduce(importStatistic, (statisticAccumulator, objectImportResult) => {
            if (objectImportResult.created) {
              statisticAccumulator.created++;
            } else if (objectImportResult.updated) {
              statisticAccumulator.updated++;
            } else if (objectImportResult.failed) {
              statisticAccumulator.failed++;
              statisticAccumulator.errors = statisticAccumulator.errors || [];
              statisticAccumulator.errors.push("Row " + objectImportResult.line + ": " + objectImportResult.error);
              //console.log("added error to accumulator, now: " + util.inspect(statisticAccumulator.errors));
            }
            return statisticAccumulator;
          }, { created: 0, updated: 0, failed: 0 }));
        })
      })
    })

      /*
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
    })*/
  });
};
