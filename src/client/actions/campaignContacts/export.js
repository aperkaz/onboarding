import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import Papa from 'papaparse';
import _ from 'lodash';

export function exportCampaignContacts(campaignContacts) {
  return function(dispatch, getState) {
    const supplierIds = campaignContacts.map(contact => contact.supplierId);
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
        const usersBySupplierId = _.keyBy(usersResponse.body, user => user.supplierId);
        const suppliersById = _.keyBy(suppliersResponse.body, supplier => supplier.supplierId);
        const contractsBySupplierId = _.keyBy(inChannelContractsReponse.body, contract => contract.supplierId);
        const baseUrl = getState().currentService.location.match(/^http(s?):\/\/[^\/]*/g)[0];

        _.each(campaignContacts, contact => {
          const supplierId = contact.supplierId;
          const user = supplierId && usersBySupplierId[supplierId] ? usersBySupplierId[supplierId] : {};
          const supplier = supplierId && suppliersById[supplierId] ? suppliersById[supplierId] : {};
          const contract = supplierId && contractsBySupplierId[supplierId] ? contractsBySupplierId[supplierId] : {};
          data.push(csvRow(user, supplier, contract, contact, baseUrl));
        });

        let csv = Papa.unparse(data, { delimiter: ';' });
        downloadCsv(csv, 'export.csv');
        return null;
      });
  }
}

function csvRow(user, supplier, inchannelContract, campaignContact, baseUrl) {
  const registrationUrl = `${baseUrl}/auth/registration/register?invitationCode=${campaignContact.invitationCode || ''}`;
  const userProfile = user.profile ? user.profile : {};
  const supplierContact = supplier.contacts && supplier.contacts.length > 0 ? supplier.contacts[0] : {};
  const supplierAddress = supplier.addresses && supplier.addresses.length > 0 ? supplier.addresses[0] : {};
  const supplierBankAccount = supplier.bankAccounts && supplier.bankAccounts.length > 0 ? supplier.bankAccounts[0] : {};
  const customerSupplierId = inchannelContract.customerSupplierId ? inchannelContract.customerSupplierId : campaignContact.customerSupplierId;

  return {
    supplierId: customerSupplierId,
    registrationUrl: registrationUrl,
    invitationCode: campaignContact.invitationCode,
    email: userProfile.email || campaignContact.email,
    companyName: supplier.supplierName || campaignContact.companyName,
    firstName: userProfile.firstName || campaignContact.contactFirstName,
    lastName: userProfile.lastName || campaignContact.contactLastName,
    phoneNumber: userProfile.phoneNo || campaignContact.telephone,
    city: supplier.cityOfRegistration || campaignContact.city,
    country: supplier.countryOfRegistration || campaignContact.country,
    commercialRegNumber: supplier.commercialRegisterNo || campaignContact.commercialRegisterNo,
    taxIdNumber: supplier.taxIdentificationNo || campaignContact.taxIdentNo,
    vatIdNumber: supplier.vatIdentificationNo || campaignContact.vatIdentNo,
    DUNSNumber: supplier.dunsNo || campaignContact.dunsNo,
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
