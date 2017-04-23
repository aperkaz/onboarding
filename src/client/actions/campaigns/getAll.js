import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGNS_LOAD_START, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_ERROR } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';

export function getAllCampaigns() {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGNS_LOAD_START
      })
    ).then(() => {
      return Promise.resolve(
        dispatch(showNotification('campaignEditor.message.info.loadingData'))
      );
    }).then(() => {
      return request.get(
        `${getState().currentService.location}/api/campaigns/`
      ).set('Accept', 'application/json').then((response) => {
        dispatch({
          type: CAMPAIGNS_LOAD_SUCCESS,
          campaigns: response.body
        })
      });
    }).catch((response) => {
      return Promise.resolve(
        dispatch(showNotification('campaignEditor.message.error.loadingData', 'error', 10))
      ).then(() => {
        dispatch({
          type: CAMPAIGNS_LOAD_ERROR,
          error: response.body
        });
      })
    }).finally(() => {
      // removing all notifications or they will be left in 'notification queue'
      dispatch(removeNotification());
    });
  }
}
