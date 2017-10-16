import groupBy from "lodash/fp/groupBy";
import fp from "lodash/fp";
import flow from "lodash/fp/flow";
import _ from 'lodash';
import { getUIStatus, isInDBstatuses } from './transformStatus'

const map = fp.map.convert({cap: false});

const formater = (campaignsRawData) => {
  const campaigns = flow(
    groupBy('campaignId'),
    map( (value, key) => {
      const temp = value.map( value => {
        const stats = {};

        if (isInDBstatuses(value.status)) {
            var UIstatus = getUIStatus(value.status);
            stats[UIstatus] = value.statusCount + (stats[UIstatus] || 0);
        } else {
            stats[value.status] = value.statusCount;
        }
        return stats;
      });
      const stats = _.merge(...temp);
      stats.name = key;
      return stats
    })
  )(campaignsRawData);

  return campaigns
}

export default formater;
