import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGN_DELETE_START, CAMPAIGN_DELETE_SUCCESS, CAMPAIGN_DELETE_ERROR } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';
import _ from 'lodash';

export function deleteCampaign(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_DELETE_START
      })
    ).then(() => {
      return request.del(
        `${_.find(getState().serviceRegistry, {
          currentApplication: true
        }).location}/api/campaigns/${campaignId}`
      ).set('Accept', 'application/json').then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.success.deleteCampaign', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_DELETE_SUCCESS,
            campaignId: campaignId
          })
        });
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.error.deleteCampaign', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_DELETE_ERROR,
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
