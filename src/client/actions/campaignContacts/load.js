import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import {
  CAMPAIGN_CONTACTS_LOAD_START,
  CAMPAIGN_CONTACTS_LOAD_SUCCESS,
  CAMPAIGN_CONTACTS_LOAD_ERROR
} from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';

export function loadCampaignContacts(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACTS_LOAD_START
      })
    ).then(() => {
      return request.get(
        `${getState().currentService.location}/api/campaigns/${campaignId}/contacts`
      ).set(
        'Accept', 'application/json'
      ).then((response) => {
        dispatch({
          type: CAMPAIGN_CONTACTS_LOAD_SUCCESS,
          campaignContacts: response.body
        })
      }).catch((response) => {
        dispatch({
          type: CAMPAIGN_CONTACTS_LOAD_ERROR,
          error: response.body
        })
      });
    });
  }
}
