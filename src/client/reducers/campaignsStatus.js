import { CAMPAIGNS_STATS_LOAD_SUCCESS } from '../constants/campaignStats';
import formatDataRaw from '../../utils/dataNormalization/getStatuses'

export default function campaignsStatus(state = [], action) {
    switch (action.type) {
        case CAMPAIGNS_STATS_LOAD_SUCCESS:
          return formatDataRaw(action.campaigns);
        default:
          return state;
    };
};
