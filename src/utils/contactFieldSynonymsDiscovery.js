const _ = require('lodash');
/* eslint-disable no-param-reassign */

const campaignContactFieldSynonyms = {
  email: ['email', 'mail', 'contactEmail', 'campaignContactEmail','email-adresse'],
  companyName: ['companyName', 'campaignContactCompany', 'company', 'company Name', 'supplier', 'supplier name', 'firmenname', 'firma','lieferant'],
  contactFirstName: ['firstName', 'name', 'First Name', 'Vorname'],
  contactLastName: ['lastName', 'last name', 'surname', 'Nachname'],
  address: ['address', 'street address', 'street', 'adresse', 'straße'],
  telephone: ['telephone', 'phone', 'contactTelephone', 'campaignContactTelephone', 'phoneNumber','telefon', 'telefon-nr', 'telefonnummer'],
  cell: ['cell', 'contactCell', 'campaignContactCell', 'cellPhone', 'cell phone','Handy','Mobiltelefon', 'Handy-Nr.', 'Mobiltel.-Nr.'],
  dunsNo: ['dunsNo','duns no', 'duns number', 'duns-number', 'd-u-n-s nr', 'd-u-n-s no', 'duns', 'd-u-n-s','duns-nummer', 'duns-nr'],
  city: ['city', 'Stadt', 'Ort'],
  country: ['country', 'state', 'land','staat'],
  commercialRegisterNo: ['register number', 'commercial registration no', 'commercial registration', 'commercial registration number', 'handelsregister-nr', 'handelsregister nr', 'handelsregister nummer'],
  taxIdentNo: ['tax identification number', 'tax identification no', 'tax no', 'tax ident no','steuernummer', 'steuer-identifikationsnummer'],
  vatIdentNo: ['vatIdentNo', 'vat id', 'vat ident no', 'vat id no', 'vat id number', 'Ust-Nr' ,'Mwst.-Nr.','Ust.-Nr.']
};

/**
 * Takes array if the field names of object from imported collection
 * (we presume that all objects in the collection have the same structure)
 * and returns object with a mapping <importObjectFieldName>: <originalFieldName>
 *
 * @param fieldNames list of the imported object field names
 * @return {<importObjectFieldName>: <originalFieldName>}
 */
module.exports.discoverSynonymFieldNames = (fieldNames) => {
  return _.reduce(fieldNames, (result, fieldName) => {
    let originalFieldName = _.findKey(campaignContactFieldSynonyms, (fieldNameSynonyms) => {
      return _.findIndex(fieldNameSynonyms, (synonym) => {
        return synonym.toLowerCase() === fieldName.toLowerCase()
      }) !== -1;
    });
    if (!_.isUndefined(originalFieldName)) {
      result[fieldName] = originalFieldName.toLowerCase();
    }
    return result;
  }, {});
}

//module.exports.discoverSynonymFieldNames = discoverSynonymFieldNames;
module.exports.campaignContactFieldSynonyms = campaignContactFieldSynonyms;
