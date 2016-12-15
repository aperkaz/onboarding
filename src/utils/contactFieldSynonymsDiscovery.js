const _ = require('lodash');
/* eslint-disable no-param-reassign */

const campaignContactFieldSynonyms = {
  email: ['email', 'mail', 'contactEmail', 'campaignContactEmail'],
  campaignId: ['campaignId', 'campaign', 'campaign id'],
  status: ['status', 'statusId', 'campaignContactStatus', 'campaignContactStatusId'],
  companyName: ['companyName', 'campaignContactCompany', 'company', 'Company', 'Company Name'],
  contactFirstName: ['contactFirstName', 'firstName', 'campaignContactFirstName', 'name', 'First Name'],
  contactLastName: ['contactLastName', 'lastName', 'campaignContactLastName', 'surname', 'Last Name'],
  address: ['address', 'contactAddress', 'campaignContactAddress'],
  dunsNo: ['dunsNo', 'duns', 'dunsNumber', 'contactDunsNo', 'campaignContactDunsNo'],
  telephone: ['telephone', 'phone', 'contactTelephone', 'campaignContactTelephone', 'phoneNumber'],
  cell: ['cell', 'contactCell', 'campaignContactCell', 'cellPhone', 'cell phone'],
  supplierId: ['supplierId', 'contactSupplierId', 'campaignContactSupplierId'],
  customerSupplierId: ['customerSupplierId', 'contactCustomerSupplierId', 'campaignContactCustomerSupplierId'],
  supplierCustomerId: ['supplierCustomerId', 'contactSupplierCustomerId', 'campaignContactSupplierCustomerId']
};

/**
 * Takes array if the field names of object from imported collection
 * (we presume that all objects in the collection have the same structure)
 * and returns object with a mapping <importObjectFieldName>: <originalFieldName>
 *
 * @param fieldNames list of the imported object field names
 * @return {<importObjectFieldName>: <originalFieldName>}
 */
function discoverSynonymFieldNames(fieldNames) {
  return _.reduce(fieldNames, (result, fieldName) => {
    let originalFieldName = _.findKey(campaignContactFieldSynonyms, (fieldNameSynonyms) => {
      return _.findIndex(fieldNameSynonyms, (synonym) => {
        return synonym.toLowerCase() === fieldName.toLowerCase()
      }) !== -1;
    });
    if (!_.isUndefined(originalFieldName)) {
      result[fieldName] = originalFieldName;
    }
    return result;
  }, {});
}

module.exports = discoverSynonymFieldNames;
