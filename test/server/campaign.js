var chai = require('chai');
var expect = chai.expect;



describe("Campaign", function () {
  function checkIfCampaignExists(name) {
      browser.url('/');
      browser.setValue('#root div:nth-child(2)  div:nth-child(1) > div > input', name);
      $$('#root div:nth-child(2) .form-submit button')[2].click();
      var foundCampaigns = $$('#root div > div:nth-child(2) table > tbody > tr > td:nth-child(1)').map(function (el) {
        return el.getText();
      }) || [];
      return foundCampaigns.indexOf(name) !== -1;
  }
  describe('is created', function () {
    it('with regular name', function () {
      var result = browser.request('post', '/api/campaigns', {"campaignId":"delete-me","status":"new","campaignType":"SupplierOnboarding"});
      expect(result[1].statusCode).to.equal(201);
    });
  });
  it('is removed', function () {
    var result = browser.request('delete', '/api/campaigns/delete-me', {});
    expect(result[1].statusCode).to.equal(200);
  });
});
