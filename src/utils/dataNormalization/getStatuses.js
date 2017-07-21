import groupBy from "lodash/fp/groupBy";
import fp from "lodash/fp";
import flow from "lodash/fp/flow";
import _ from 'lodash';

const map = fp.map.convert({cap: false});

const formater = (campaignsRawData) => {
  const campaigns = flow(
    groupBy('campaignId'),
    map( (value, key) => {
      const temp = value.map( value => {
        const stats = {};
        if (["new", "queued", "generatingInvitation", "invitationGenerated", "sending", "sent"].includes(value.status)) {
          stats["started"] = _.sum([value.statusCount,stats["started"]]) || 0;
        }
        else {
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