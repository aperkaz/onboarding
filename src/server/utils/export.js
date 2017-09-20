const Promise = require('bluebird')
const Papa = require('papaparse')
const _ = require('lodash')

const querystring = require('querystring');



module.exports = function exportCampaignContacts(campaignCampaignId, serviceClient, db) {

  return db.models.Campaign.findOne({
    where: {
      campaignId: campaignCampaignId
    }
  }).then(campaign => {
    const result = db.models.CampaignContact.findAll({
      where: {
        campaignId: campaign.id
      }
  });

  return Promise.all([campaign, result]);
  }).spread((campaign, contacts) => {
    const supplierIds = contacts.map(contact => contact.supplierId);
    const campaignId = contacts[0].campaignId;

    const usersPromise = serviceClient.get('onboarding', `/api/campaigns/${campaignId}/api/users/`);

    const suppliersPromise = serviceClient.get('supplier', `/api/suppliers?${
      querystring.stringify({
        supplierId: supplierIds.join(','),
        include: 'contacts,addresses,bankAccounts'
      })
    }`);

    const inChannelContractsPromise = serviceClient.get('onboarding', `/api/campaigns/${campaignId}/inchannelContacts?${
      querystring.stringify({ supplierIds: supplierIds })
    }`);

     return Promise.all([campaign, contacts, usersPromise, suppliersPromise, inChannelContractsPromise]);
  }).spread((campaign, contacts, usersResponse, suppliersResponse, inChannelContractsReponse) => {
    const data = [];
    const usersBySupplierId = _.keyBy(usersResponse, user => user.supplierId);
    const suppliersById = _.keyBy(suppliersResponse, supplier => supplier.supplierId);
    const contractsBySupplierId = _.keyBy(inChannelContractsReponse, contract => contract.supplierId);
    const baseUrl = 'http://businessnetwork.opuscapita.com'

    _.each(contacts, contact => {
      const supplierId = contact.supplierId;
      const user = supplierId && usersBySupplierId[supplierId] ? usersBySupplierId[supplierId] : {};
      const supplier = supplierId && suppliersById[supplierId] ? suppliersById[supplierId] : {};
      const contract = supplierId && contractsBySupplierId[supplierId] ? contractsBySupplierId[supplierId] : {};
      data.push(csvRow(user, supplier, contract, contact, campaign, baseUrl));
    });

    return Papa.unparse(data, { delimiter: ';' });
  });
}


function csvRow(user, supplier, inchannelContract, campaignContact, campaign, baseUrl) {
  const registrationUrl = `${baseUrl}/onboarding/public/landingpage/c_${campaign.customerId}/${campaign.campaignId}/${campaignContact.id}?transition=loaded`;
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
