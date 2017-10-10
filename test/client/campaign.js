var chai = require('chai');
var expect = chai.expect;


describe("Campaign", function () {
  
  it('is created', function () {
    browser.url('/create');
    browser.waitForExist('.form-submit .btn-primary');
    var fields = $$('div.form-horizontal input');
    fields[0].setValue('delete-me');
    //var result = browser.request('post', '/api/campaigns', {"campaignId":"delete-me","status":"new","campaignType":"SupplierOnboarding"});
    browser.element('.form-submit .btn-primary').click();
    browser.waitUntil(function () {
      return browser.getUrl().indexOf("delete-me") !== -1;
    }, 5000, 'expected redirect to edit view');
    expect(browser.getUrl()).to.include('delete-me');
  });

  it('isn\'t created with description longer than 50 characters', function () {
    browser.url('/create');
    browser.waitForExist('.form-submit .btn-primary');
    var fields = $$('div.form-horizontal input');
    fields[0].setValue('delete-me-description');
    fields[1].setValue('Description longer than 50 characters. ----------------------------------------------');
    browser.element('.form-submit .btn-primary').click();
    expect($$('#root .form-group.has-error')[0]).to.exist;
  });

  it('can be found', function () {
    browser.url('/');
    browser.setValue('#root div:nth-child(2)  div:nth-child(1) > div > input', "delete-me");
    $$('#root div:nth-child(2) .form-submit button')[2].click();
    var foundCampaigns = $$('#root div > div:nth-child(2) table > tbody > tr > td:nth-child(1)').map(function (el) {
        return el.getText();
      }) || [];
    expect(foundCampaigns.indexOf("delete-me")).to.not.equal(-1);
  });

  it('is editable', function () {
    browser.url('/');

    browser.setValue('#root div:nth-child(2)  div:nth-child(1) > div > input', "delete-me");
    $$('#root div:nth-child(2) .form-submit button')[2].click();
    browser.waitForExist('table td .glyphicon-edit');
    $$('table td .glyphicon-edit')[0].click();

    browser.waitUntil(function () {
      return $$('div.form-horizontal input')[0].getValue() === 'delete-me';
    }, 5000, 'expected edit form to populate with data');
    $$('.form-horizontal input')[1].setValue('Description data');
    browser.element('.form-submit .btn-primary').click();

    browser.url('/');
    browser.waitForExist('table td .glyphicon-edit');
    $$('table td .glyphicon-edit')[1].click();

    browser.waitUntil(function () {
      return $$('div.form-horizontal input')[1].getValue() === 'Description data';
    }, 5000, 'expected edit form to populate with changed data');
  });

  it('can be removed', function () {
    browser.url('/');
    /* As I am writing these test searching does not work and i need to use "all campaigns" view */
    /* It will break if more than two campaign exists in time of testing */

    // browser.setValue('#root div:nth-child(2)  div:nth-child(1) > div > input', "delete-me");
    // $$('#root div:nth-child(2) .form-submit button')[2].click();
    // browser.waitForExist('table td .glyphicon-edit');
    // $$('table td .glyphicon-edit')[0].click();

    browser.waitForExist('table td .glyphicon-edit');
    $$('table td .glyphicon-trash')[1].click();
    $$('.modal-dialog .btn-primary')[0].click();
    browser.url('/');
    browser.waitForExist('table td .glyphicon-edit');

    var foundCampaigns = $$('#root div > div:nth-child(2) table > tbody > tr > td:nth-child(1)').map(function (el) {
        return el.getText();
      }) || [];
    expect(foundCampaigns.indexOf("delete-me")).to.equal(-1);
  });


});
