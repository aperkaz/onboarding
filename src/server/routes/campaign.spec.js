const chai = require('chai');
const expect = chai.expect;
const { getCurrentUserCampaignsQuery } = require('./campaign');

describe('Tests for Campaign route query utils', function() {
  describe('getCurrentUserCampaignsQuery', function() {
    it('should return null if user has "xtenant" role', function() {
      const userData = {
        customerid: 'test',
        roles: ['user', 'admin', 'xtenant']
      };
      const query = getCurrentUserCampaignsQuery(userData);

      expect(query).to.be.a('null');
    });

    it('should return null if user has "xtenant" role and customerid', function() {
      const userData = {
        customerid: 'test',
        roles: ['user', 'admin', 'xtenant']
      };
      const query = getCurrentUserCampaignsQuery(userData);

      expect(query).to.be.a('null');
    });

    it('should return object with customerId property and value of user.customerid if user has customerid property', function() {
      const userData = {
        customerid: 'test',
        roles: ['user', 'admin']
      };
      const query = getCurrentUserCampaignsQuery(userData);

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({ customerId: userData.customerid });
    });

    it('should return object with customerId property with empty string value if user has no customerid property', function() {
      const userData = {
        roles: ['user', 'admin']
      };
      const query = getCurrentUserCampaignsQuery(userData);

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({ customerId: '' });
    });

    it('should return object with customerId property with empty string value if user.customerid is an empty string', function() {
      const userData = {
        customerid: '',
        roles: ['user', 'admin']
      };
      const query = getCurrentUserCampaignsQuery(userData);

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({ customerId: '' });
    });
  });
});
