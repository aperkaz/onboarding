import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START, CAMPAIGN_FIND_START, CAMPAIGN_FIND_SUCCESS, CAMPAIGN_FIND_ERROR } from '../constants/campaigns';
import { CAMPAIGN_DELETE_SUCCESS, CAMPAIGN_DELETE_ERROR } from '../constants/campaigns';
import { CAMPAIGN_CREATE_SUCCESS, CAMPAIGN_STARTING_SUCCESS } from '../constants/campaigns';
import _ from 'lodash';

/**
 * After getting data from the server side dates are in iso format (2016-11-16T11:11:48.000Z)
 * we need to convert them into Date objects
 * @param isoDate string
 * @returns Date/undefined
 */
const transformISODateToDate = (isoDate) => {
  if (!_.isNull(isoDate) && !_.isUndefined(isoDate)) {
    return new Date(isoDate);
  }

  return undefined;
};

// State of Campaign reducer:
// {
//     campaigns: [],
//     error: {},
//     loading: true / false
// }
export default function campaignList(state = {}, action) {
  switch (action.type) {
    case CAMPAIGN_FIND_START:
      return {
        ...state,
        loading: true
      };
    case CAMPAIGN_FIND_SUCCESS:
      let formattedCampaign = {
        ...action.campaign,
        startsOn: transformISODateToDate(action.campaign.startsOn),
        endsOn: transformISODateToDate(action.campaign.endsOn)
      };
      return {
        ...state,
        loading: false,
        campaigns: _.concat(state.campaigns, formattedCampaign)
      };
    case CAMPAIGN_FIND_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
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
    case CAMPAIGN_STARTING_SUCCESS:
      let campaigns = _.map(state.campaigns, (campaign) =>{
        if(campaign.campaignId===action.campaign.campaignId) return campaign=action.campaign;
        else return campaign;
      });
      return {
        ...state,
        campaigns: campaigns
      };
    default:
      return state;
  }
}
