import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START } from '../constants/campaigns';
import { CAMPAIGN_DELETE_SUCCESS, CAMPAIGN_DELETE_ERROR } from '../constants/campaigns';
import { CAMPAIGN_CREATE_SUCCESS } from '../constants/campaigns';
import _ from 'lodash';

//State of Campaign reducer:
// {
//     campaigns: [],
//     error: {},
//     loading: true / false
// }
export default function campaignList(state = {}, action) {
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
        campaigns: _.map(action.campaigns, (cmp) => {
          return {
            ...cmp,
            startsOn: transformISODateToDate(cmp.startsOn),
            endsOn: transformISODateToDate(cmp.endsOn)
          }
        })
      };
    case CAMPAIGNS_LOAD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case CAMPAIGN_CREATE_SUCCESS:
      return {
        ...state,
        campaigns: _.concat(state.campaigns, action.newCampaign)
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
};

/**
 * After getting data from the server side dates are in iso format (2016-11-16T11:11:48.000Z)
 * we need to convert them into Date objects
 * @param isoDate string
 * @returns Date/undefined
 */
const transformISODateToDate = (isoDate) => {
  if(!_.isNull(isoDate) && !_.isUndefined(isoDate)){
    return new Date(isoDate);
  }

  return undefined;
};
