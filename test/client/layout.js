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

    it("contains tenant name", function() {
      // data got from user's service test data
      expect($('.navbar-main-menu ul.nav > li.dropdown:nth-child(2) > a').getHTML()).to.include('no tenant');
    });

  });
  describe("sidebar", function () {
    before(function () {
      browser.url('/dashboard/');
    });

    it("is visible", function () {
      expect(browser.isVisible('section.sidebar')).to.equal(true);
    });

    it("shrinks on iPad", function() {
      browser.setViewportSize({
        width: 1000,
        height: 500
      });
      expect(browser.getElementSize('section.sidebar', 'width')).to.be.below(80);
    });


    it("hides on mobile", function() {
      browser.setViewportSize({
        width: 500,
        height: 500
      });
      expect(browser.getElementSize('section.sidebar', 'width')).to.equal(0);
    });

  });
});
