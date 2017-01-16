import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
//import { CAMPAIGN_SERVICE_NAME } from '../../constants/services'
import { CAMPAIGN_STARTING_START, CAMPAIGN_STARTING_SUCCESS, CAMPAIGN_STARTING_ERROR } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';

export function startCampaign(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_STARTING_START
      })
    ).then(() => {
      return request.put(
        `${_.find(getState().serviceRegistry, {
          currentApplication: true
        }).location}/api/campaigns/start/${campaignId}`
      ).set('Accept', 'application/json').then((response) => {
        let campaign = response.body;
        return Promise.resolve(
          dispatch(showNotification('campaign.message.success.start', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_STARTING_SUCCESS,
            campaign: campaign
          })
        });
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaign.message.error.start', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_STARTING_ERROR,
            error: response.body
          });
        })
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    })
  }
}
