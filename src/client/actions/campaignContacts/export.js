import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import Papa from 'papaparse';
import _ from 'lodash';

export function exportCampaignContacts(campaignContacts) {
  return function(dispatch, getState) {
    const contactsBySupplierId = _.keyBy(campaignContacts, contact => contact.supplierId);
    const supplierIds = Object.keys(contactsBySupplierId);
    const campaignId = campaignContacts[0].campaignId;

    let usersPromise = request.get(`/onboarding/api/campaigns/${campaignId}/users`).
      set('Accept', 'application/json').promise();

    let suppliersPromise = request.get(`/supplier/api/suppliers`).
      query({ supplierId: supplierIds.join(','), include: 'contacts,addresses,bankAccounts' }).
      set('Accept', 'application/json').promise();

    let inChannelContractsPromise = request.get(`/onboarding/api/campaigns/${campaignId}/inchannelContacts`).
      query({ supplierIds: supplierIds }).set('Accept', 'application/json').promise();

    return Promise.all([usersPromise, suppliersPromise, inChannelContractsPromise]).
      then(([usersResponse, suppliersResponse, inChannelContractsReponse]) => {
        let data = [];
        const supplierById = _.keyBy(suppliersResponse.body, supplier => supplier.supplierId);
        const contractsBySupplierId = _.keyBy(inChannelContractsReponse.body, supplier => supplier.supplierId);
        const baseUrl = getState().currentService.location.match(/^http(s?):\/\/[^\/]*/g)[0];

        _.each(usersResponse.body, user => {
          const supplierId = user.supplierId;
          if (supplierId) {
            const invitationCode = contactsBySupplierId[supplierId] ? contactsBySupplierId[supplierId].invitationCode : '';
            const registrationUrl = `${baseUrl}/registration/register?invitationCode=${invitationCode}`;
            data.push(csvRow(user.profile, supplierById[supplierId], contractsBySupplierId[supplierId], registrationUrl));
          }
        });

        let csv = Papa.unparse(data, { delimiter: ';' });
        downloadCsv(csv, 'export.csv');
        return null;
      });
  }
}

function csvRow(userProfile, supplier, inchannelContract, registrationUrl) {
  const supplierContact = supplier ? supplier.contacts[0] : {};
  const supplierAddress = supplier ? supplier.addresses[0] : {};
  const supplierBankAccount = supplier ? supplier.bankAccounts[0] : {};
  const customerSupplierId = inchannelContract ? inchannelContract.customerSupplierId : '';

  return {
    supplierId: customerSupplierId,
    registrationUrl: registrationUrl,
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
