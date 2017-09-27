import { CAMPAIGNS_STATS_LOAD_SUCCESS } from '../constants/campaignStats';

export default function campaignsStatus(state = [], action) {
    switch (action.type) {
        case CAMPAIGNS_STATS_LOAD_SUCCESS:
          return action.campaigns;
        default:
          return state;
    };
};
