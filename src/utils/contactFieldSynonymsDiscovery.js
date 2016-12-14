const campaignContactFieldSynonyms = {
  email: ['email', 'mail', 'contactEmail', 'campaignContactEmail'],
  campaignId: ['campaignId', 'campaign'],
  status: ['status', 'statusId', 'campaignContactStatus', 'campaignContactStatusId'],
  companyName: ['companyName', 'campaignContactCompany', 'company', 'Company'],
  contactFirstName: ['contactFirstName', 'firstName', 'campaignContactFirstName', 'name', 'First Name'],
  contactLastName: ['contactLastName', 'lastName', 'campaignContactLastName', 'surname', 'Last Name'],
  address: ['address', 'contactAddress', 'campaignContactAddress'],
  dunsNo: ['dunsNo', 'duns', 'dunsNumber', 'contactDunsNo', 'campaignContactDunsNo'],
  telephone: ['telephone', 'phone', 'contactTelephone', 'campaignContactTelephone'],
  cell: ['cell', 'contactCell', 'campaignContactCell'],
  supplierId: ['supplierId', 'contactSupplierId', 'campaignContactSupplierId'],
  customerSupplierId: ['customerSupplierId', 'contactCustomerSupplierId', 'campaignContactCustomerSupplierId'],
  supplierCustomerId: ['supplierCustomerId', 'contactSupplierCustomerId', 'campaignContactSupplierCustomerId']
};

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
