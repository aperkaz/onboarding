var chai = require('chai');
var expect = chai.expect;


describe("Layout", function () {
  describe("top panel", function () {
    before(function () {
      browser.url('/dashboard/');
    });

    it("is visible", function () {
      expect(browser.isVisible('.navbar-main-menu')).to.equal(true);
    });
    //FIXME: as i am writing those tests recent develop does not work, enable it
    xit("contains tenant name", function() {
      // data got from user's service test data
      expect($('.navbar-main-menu ul.nav > li.dropdown:nth-child(2) > a').getHTML()).to.include('ncc');
    });

  });
});
