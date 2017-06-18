import { CAMPAIGNS_STATS_LOAD_SUCCESS } from '../constants/campaignStats';
import groupBy from "lodash/fp/groupBy";
import fp from "lodash/fp";
import flow from "lodash/fp/flow";
import _ from 'lodash';

const map = fp.map.convert({cap: false});
export default function campaignsStatus(state = [], action) {
    switch (action.type) {
        case CAMPAIGNS_STATS_LOAD_SUCCESS:
            const campaigns = flow(
              groupBy('campaignId'),
              map( (value, key) => {
                const temp = value.map( value => {
                  const stats = {};
                  stats[value.status] = value.statusCount;
                  return stats;
                });
                const stats = _.merge(...temp);
                stats.name = key;
                return stats
              })
            )(action.campaigns);

            return campaigns;
        default:
            return state;
    };
};
