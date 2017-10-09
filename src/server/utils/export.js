const Promise = require('bluebird');
const Papa = require('papaparse');
const _ = require('lodash');
const querystring = require('querystring');

module.exports = function exportCampaignContacts(customerId, campaignCampaignId, serviceClient, db) {

    return db.models.Campaign.findOne({
        where: {
            campaignId: campaignCampaignId,
            customerId: customerId
        }
    })
    .then(campaign => {
        const result = db.models.CampaignContact.findAll({
            where: {
                campaignId: campaign.id
            }
        });

        return Promise.all([campaign, result]);
    })
    .spread((campaign, contacts) => {
        const supplierIds = contacts.map(contact => contact.supplierId);
        const campaignId = campaign.id;

        // TODO: replace with local call
        const usersPromise = serviceClient.get('onboarding', `/api/campaigns/${campaignId}/api/users/`).spread((data, res) => data);

        const suppliersPromise = serviceClient.get('supplier', `/api/suppliers?${
            querystring.stringify({
                supplierId: supplierIds.join(','),
                include: 'contacts,addresses,bankAccounts'
            })
        }`).spread((data, res) => data);

        // TODO: replace with local call
        const inChannelContractsPromise = serviceClient.get('onboarding', `/api/campaigns/${campaignId}/inchannelContacts?${
            querystring.stringify({ supplierIds: supplierIds })
        }`).spread((data, res) => data);

        return Promise.all([campaign, contacts, usersPromise, suppliersPromise, inChannelContractsPromise]);
    })
    .spread((campaign, contacts, usersResponse, suppliersResponse, inChannelContractsReponse) => {

        const data = [];
        const usersBySupplierId = _.keyBy(usersResponse, user => user.supplierId);
        const suppliersById = _.keyBy(suppliersResponse, supplier => supplier.supplierId);
        const contractsBySupplierId = _.keyBy(inChannelContractsReponse, contract => contract.supplierId);
        const baseUrl = 'http://businessnetwork.opuscapita.com';

        _.each(contacts, contact => {
            const supplierId = contact.supplierId;
            const user = supplierId && usersBySupplierId[supplierId] ? usersBySupplierId[supplierId] : {};
            const supplier = supplierId && suppliersById[supplierId] ? suppliersById[supplierId] : {};
            const contract = supplierId && contractsBySupplierId[supplierId] ? contractsBySupplierId[supplierId] : {};
            data.push(csvRow(user, supplier, contract, contact, campaign, baseUrl));
        });

        return Papa.unparse(data, {
            delimiter: ';'
        });
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
        CompanyName: supplier.supplierName || campaignContact.companyName,
        Status: campaignContact.status,
        Email: userProfile.email || campaignContact.email,
        SupplierId: customerSupplierId,
        RegistrationUrl: registrationUrl,
        InvitationCode: campaignContact.invitationCode,
        FirstName: userProfile.firstName || campaignContact.contactFirstName,
        LastName: userProfile.lastName || campaignContact.contactLastName,
        PhoneNumber: userProfile.phoneNo || campaignContact.telephone,
        City: supplier.cityOfRegistration || campaignContact.city,
        Country: supplier.countryOfRegistration || campaignContact.country,
        CommercialRegNumber: supplier.commercialRegisterNo || campaignContact.commercialRegisterNo,
        TaxIdNumber: supplier.taxIdentificationNo || campaignContact.taxIdentNo,
        VatIdNumber: supplier.vatIdentificationNo || campaignContact.vatIdentNo,
        DUNSNumber: supplier.dunsNo || campaignContact.dunsNo,
        GlobalLocationNumber: supplier.globalLocationNo,
        ContactFirstName: supplierContact.firstName,
        ContactLastName: supplierContact.lastName,
        ContactEmail: supplierContact.email,
        ContactPhone: supplierContact.phone,
        ContactMobile: supplierContact.mobile,
        AddressStreet: supplierAddress.street,
        AddressZipCode: supplierAddress.zipCode,
        AddressCity: supplierAddress.city,
        AddressCountry: supplierAddress.countryId,
        BankName: supplierBankAccount.bankName,
        IBAN: supplierBankAccount.accountNumber,
        BIC: supplierBankAccount.bankIdentificationCode
    };
}
