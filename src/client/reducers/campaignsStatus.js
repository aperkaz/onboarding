import { CAMPAIGNS_STATS_LOAD_SUCCESS } from '../constants/campaignStats';
import _ from 'lodash';

export default function campaignsStatus(state = [], action) {
    switch (action.type) {
        case CAMPAIGNS_STATS_LOAD_SUCCESS:
            const campaigns = _(action.campaigns)
            .groupBy('campaignId')
            .map( (value, key) => {
                const temp = value.map( value => {
                    const stats = {};
                    stats[value.status] = value.statusCount;
                    return stats;
                });
                const stats = _.merge(...temp);
                stats.name = key;
                return stats
            })
            .value();
            return campaigns;
        default:
            return state;
    };
};