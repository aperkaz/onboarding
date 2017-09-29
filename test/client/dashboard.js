/**
 * Created by celber on 11.07.2017.
 */
var chai = require('chai');
var expect = chai.expect;



describe("Dashboard", function () {
  // TODO: all tests need to wait for named components in react-components
  xit("has four graphs", function () {
    expect($$('.row > div > .panel').length).to.equal(4);
  });
});
