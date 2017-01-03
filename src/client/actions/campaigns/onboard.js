import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGN_SERVICE_NAME } from '../../constants/services'

export function onLoadCampaignPage(campaignId, contactId, transition) {
  return function(dispatch, getState) {
    return request.get(
      `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/transition/${campaignId}/${contactId}?transition=${transition}`
    ).set('Accept', 'application/json').then((response) => {
      console.log('SUCCESS', response);
    }).catch((response) => {
      console.log('ERROR', response);
    })
  }
}
