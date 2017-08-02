const _ = require('lodash');
/* eslint-disable no-param-reassign */

const campaignContactFieldSynonyms = {
  customerSupplierId: ['Supplier', 'SupplierId', 'SupplierNumber', 'CustomerSupplierId', 'Lieferant', 'Kreditor'],
  email: ['email', 'mail', 'contactEmail', 'campaignContactEmail','email-adresse', 'EmailAddress', 'E-Mail', 'E-Mail-Adresse'],
  companyName: ['companyName', 'campaignContactCompany', 'company', 'company Name', 'supplier', 'supplier name', 'Firmenname', 'Firma','Lieferant', 'Name'],
  contactFirstName: ['firstName', 'name', 'First Name', 'Vorname'],
  contactLastName: ['lastName', 'last name', 'surname', 'Nachname'],
  address: ['address', 'street address', 'street', 'Adresse', 'Straße'],
  telephone: ['telephone', 'phone', 'contactTelephone', 'campaignContactTelephone', 'phoneNumber','Telefon', 'Telefon-Nr', 'Telefonnummer'],
  cell: ['cell', 'contactCell', 'campaignContactCell', 'cellPhone', 'cell phone','Handy','Mobiltelefon', 'Handy-Nr.', 'Mobiltel.-Nr.'],
  dunsNo: ['dunsNo','duns no', 'duns number', 'duns-number', 'd-u-n-s no', 'D-U-N-S', 'DUNS', 'D-U-N-S Nr', 'DUNS-Nummer', 'DUNS-Nr'],
  zipCode: ['zipCode', 'PostalCode', 'PostCode', 'PLZ', 'Postleitzahl'],
  city: ['city', 'Stadt', 'Ort'],
  pobox: ['PoBox', 'PostOfficeBox', 'Postfach', 'Postschließfach'],
  country: ['country', 'state', 'countryCode', 'Land', 'Staat'],
  commercialRegisterNo: ['register number', 'commercial registration no', 'commercial registration', 'commercial registration number', 'HandelsregisterNr', 'Handelsregister Nr', 'Handelsregister Nummer'],
  taxIdentNo: ['tax identification number', 'tax identification no', 'tax no', 'tax ident no','Steuernummer', 'Steuer-Identifikationsnummer'],
  vatIdentNo: ['vatIdentNo', 'vat id', 'vat ident no', 'vat id no', 'vat id number', 'VATRegistrationNumber', 'Ust-Nr', 'Umsatzsteuer-Id.Nr' ,'Mwst.-Nr.','Ust.-Nr.']
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
