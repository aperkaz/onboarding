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
      let csv = Papa.unparse(suppliersResponse.body, { delimiter: ';' });
      downloadCsv(csv, 'export.csv');
      return null;
    });
  }
}

function downloadCsv(csvData, fileName) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}
