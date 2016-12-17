const assert = require('chai').assert;
const expect = require('chai').expect;
const _ = require('lodash');
const sortPopulationConfigs = require('./sortPopulationConfigs');

/**
 * Unit tests for sortPopulationConfigs
 */
describe('populationConfigComparator', () => {
  it('test dependency sorting', () => {
    let mockPopulationConfig = [
      {
        model: "a",
        dependsOn: "c"
      },
      {
        model: "b",
        dependsOn: "d"
      },
      {
        model: "c",
        dependsOn: "d"
      },
      {
        model: "d",
      }
    ];
    mockPopulationConfig = sortPopulationConfigs(mockPopulationConfig);
    let aIdx = _.findIndex(mockPopulationConfig, { model: "a" });
    let bIdx = _.findIndex(mockPopulationConfig, { model: "b" });
    let cIdx = _.findIndex(mockPopulationConfig, { model: "c" });
    let dIdx = _.findIndex(mockPopulationConfig, { model: "d" });

    expect(aIdx).to.be.above(cIdx);
    expect(bIdx).to.be.above(dIdx);
    expect(cIdx).to.be.above(dIdx);
  });

  it('test sorting without dependencies', () => {
    let mockPopulationConfig = sortPopulationConfigs([
      {
        model: "a"
      },
      {
        model: "b"
      }
    ]);
    assert.equal(_.findIndex(mockPopulationConfig, { model: "a" }), 0);
    assert.equal(_.findIndex(mockPopulationConfig, { model: "b" }), 1);
  })
});
