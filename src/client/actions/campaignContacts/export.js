import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import Papa from 'papaparse';

export function exportCampaignContacts(campaignId) {
  return function(dispatch, getState) {
    let data = [{
      "supplierId": "hard001",
      "supplierName": "Hardware AG",
      "cityOfRegistration": "Minsk",
      "countryOfRegistration": "DE",
      "role": "selling",
      "foundedOn": "2015-10-04 22:00:00",
      "globalLocationNo": "123",
      "homePage": "http://hard.ware.ag",
      "legalForm": "KG",
      "registrationNumber": "MI651355",
      "status": "new",
      "createdBy": "john.doe@ncc.com",
      "changedBy": "john.doe@ncc.com"
    }];
    let csv = Papa.unparse(data, { delimiter: ';' });
    downloadCsv(csv, 'export.csv');
    return Promise.resolve();
  }
}

function downloadCsv(csvData, fileName) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}
