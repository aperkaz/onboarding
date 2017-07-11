/**
 * Created by celber on 11.07.2017.
 */
var chai = require('chai');
var expect = chai.expect;



describe("Campaign", function () {
  it("has four graphs", function () {
    expect($$('.row > div > .panel').length).to.equal(4);
  });
});
