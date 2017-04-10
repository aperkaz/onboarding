import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CONTACT_LOAD_SUCCESS } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';

export function onLoadCampaignPage(campaignId, contactId, transition) {
  return function(dispatch, getState) {
    return request.get(
      `${getState().currentService.location}/public/transition/${campaignId}/${contactId}?transition=${transition}`
    ).set('Accept', 'application/json').then((response) => {
      let onboardingCampaignContact = response.body;
      return Promise.resolve(
        dispatch(showNotification('campaign.message.success.load'))
      ).then(() => {
        dispatch({
          type: CONTACT_LOAD_SUCCESS,
          campaignContact: onboardingCampaignContact
        });
      })
    }).catch((response) => {
      // dispatch(showNotification('campaign.message.error.load', 'error', 10))
    }).finally(() => {
      // removing all notifications or they will be left in 'notification queue'
      dispatch(removeNotification());
    });
  }
}
