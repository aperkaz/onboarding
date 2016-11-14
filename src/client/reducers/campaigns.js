import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START } from '../constants/campaigns';
import { CAMPAIGN_DELETE_SUCCESS, CAMPAIGN_DELETE_ERROR } from '../constants/campaigns';
import _ from 'lodash';

//State of Campaign reducer:
// {
//     campaigns: [],
//     error: {},
//     loading: true / false
// }

export default function campaign(state = {}, action) {
  switch (action.type) {
    case CAMPAIGNS_LOAD_START:
      return {
        ...state,
        loading: true
      };
    case CAMPAIGNS_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        campaigns: action.campaigns
      };
    case CAMPAIGNS_LOAD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case CAMPAIGN_DELETE_SUCCESS:
      return {
        ...state,
        campaigns: _.reject(state.campaigns, { campaignId: action.campaignId })
      };
    case CAMPAIGN_DELETE_ERROR:
      return {
        ...state,
        error: action.error
      };
    default:
      return state;
  }
}
