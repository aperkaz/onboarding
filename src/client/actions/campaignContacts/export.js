import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import Papa from 'papaparse';
import _ from 'lodash';

export function exportCampaignContacts(campaignContacts) {
  return function(dispatch, getState) {
    const supplierIds = _.map(campaignContacts, contact => contact.supplierId);
    const campaignId = campaignContacts[0].campaignId;

    let usersPromise = request.get(`/onboarding/api/campaigns/${campaignId}/users`).
      set('Accept', 'application/json').promise();

    let suppliersPromise = request.get(`/supplier/api/suppliers`).
      query({ supplierId: supplierIds.join(','), include: 'contacts,addresses,bankAccounts' }).
      set('Accept', 'application/json').promise();

    return Promise.all([usersPromise, suppliersPromise]).then(([usersResponse, suppliersResponse]) => {
      let data = [];
      const supplierById = _.keyBy(suppliersResponse.body, supplier => supplier.supplierId);

      _.each(usersResponse.body, user => {
        const supplierId = user.supplierId;
        if (supplierId) data.push(csvRow(user.profile, supplierById[supplierId]));
      });

      let csv = Papa.unparse(data, { delimiter: ';' });
      downloadCsv(csv, 'export.csv');
      return null;
    });
  }
}

function csvRow(userProfile, supplier) {
  const supplierContact = supplier.contacts[0] || {}
  const supplierAddress = supplier.addresses[0] || {}
  const supplierBankAccount = supplier.bankAccounts[0] || {}

  return {
    email: userProfile.email,
    companyName: supplier.supplierName,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    phoneNumber: userProfile.phoneNo,
    city: supplier.cityOfRegistration,
    country: supplier.countryOfRegistration,
    commercialRegNumber: supplier.commercialRegisterNo,
    taxIdNumber: supplier.taxIdentificationNo,
    vatIdNumber: supplier.vatIdentificationNo,
    DUNSNumber: supplier.dunsNo,
    globalLocationNumber: supplier.globalLocationNo,
    contactFirstName: supplierContact.firstName,
    contactLastName: supplierContact.lastName,
    contactEmail: supplierContact.email,
    contactPhone: supplierContact.phone,
    contactMobile: supplierContact.mobile,
    addressStreet: supplierAddress.street,
    addressZipCode: supplierAddress.zipCode,
    addressCity: supplierAddress.city,
    addressCountry: supplierAddress.countryId,
    bankName: supplierBankAccount.bankName,
    IBAN: supplierBankAccount.accountNumber,
    BIC: supplierBankAccount.bankIdentificationCode
  };
}

function downloadCsv(csvData, fileName) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}