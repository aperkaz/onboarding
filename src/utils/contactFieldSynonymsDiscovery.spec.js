const assert = require('chai').assert;
const expect = require('chai').expect;
const discoverSynonymFieldNames = require('./contactFieldSynonymsDiscovery');
const _ = require('lodash');

describe('discoverSynonymFieldNames', () => {
  const campaignContactFieldNames = [
    'email',
    'campaignId',
    'status',
    'companyName',
    'contactFirstName',
    'contactLastName',
    'address',
    'dunsNo',
    'telephone',
    'cell',
    'supplierId',
    'customerSupplierId',
    'supplierCustomerId'
  ];

  const synonymFieldNames = [
    'mail',
    'campaign id',
    'statusId',
    'Company Name',
    'First Name',
    'Last Name',
    'campaignContactAddress',
    'duns',
    'phoneNumber',
    'cell phone',
    'campaignContactSupplierId',
    'contactCustomerSupplierId',
    'contactSupplierCustomerId'
  ];


  it('works with the same field names', () => {
    let fieldMapping = discoverSynonymFieldNames(campaignContactFieldNames);
    assert.equal(_.size(fieldMapping), _.size(campaignContactFieldNames));
    _.forIn(fieldMapping, (v, k) => {
      assert.equal(k, v);
    })
  });


  it('works with synonym field names', () => {
    let fieldMapping = discoverSynonymFieldNames(synonymFieldNames);
    _.forIn(fieldMapping, (originalFieldName, synonymFieldName) => {
      assert.equal(
        _.indexOf(campaignContactFieldNames, originalFieldName),
        _.indexOf(synonymFieldNames, synonymFieldName)
      );
    });
  });

  it('works in case-insensitive mode', () => {
    let capitalizedSynonymFieldNames = _.map(synonymFieldNames, _.capitalize);
    let fieldMapping = discoverSynonymFieldNames(capitalizedSynonymFieldNames);
    _.forIn(fieldMapping, (originalFieldName, synonymFieldName) => {
      assert.equal(
        _.indexOf(campaignContactFieldNames, originalFieldName),
        _.indexOf(capitalizedSynonymFieldNames, synonymFieldName)
      );
    });
  });

  it('returns undefined values for wrong field names', ()=> {
    let invalidFieldNames = ['wrong', 'incorrect', 'unknown'];
    let fieldMapping = discoverSynonymFieldNames(invalidFieldNames);
    _.each(invalidFieldNames, (invalidFieldName) => {
      expect(fieldMapping[invalidFieldName]).to.be.undefined;
    });
  })
});
