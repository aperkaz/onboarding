import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGN_FIND_START, CAMPAIGN_FIND_SUCCESS, CAMPAIGN_FIND_ERROR } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';

export function findCampaign(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_FIND_START
      })
    ).then(() => {
      return Promise.resolve(
        dispatch(showNotification('campaignEditor.message.info.loadingData'))
      );
    }).then(() => {
      return request.get(
        `${getState().currentService.location}/api/campaigns/${campaignId}`
      ).set('Accept', 'application/json').then((response) => {
        dispatch({
          type: CAMPAIGN_FIND_SUCCESS,
          campaign: response.body
        })
      });
    }).catch((response) => {
      return Promise.resolve(
        dispatch(showNotification('campaignEditor.message.error.loadingData', 'error', 10))
      ).then(() => {
        dispatch({
          type: CAMPAIGN_FIND_ERROR,
          error: response.body
        });
      })
    }).finally(() => {
      // removing all notifications or they will be left in 'notification queue'
      dispatch(removeNotification());
    });
  }
}
