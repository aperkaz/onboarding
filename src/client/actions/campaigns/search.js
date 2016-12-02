import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import { CAMPAIGN_SERVICE_NAME } from '../../constants/services'
import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START } from '../../constants/campaigns'
import { CAMPAIGN_FIELDS } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';
import { prepareParams } from './utils';
import { SEARCH_CAMPAIGN_FORM } from '../../constants/forms';

const searchFormValueSelector = formValueSelector(SEARCH_CAMPAIGN_FORM);

export function searchCampaigns() {
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
      return request.get(`${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns`).query(
        prepareParams(searchFormValueSelector(
          getState(),
          ...CAMPAIGN_FIELDS
        ))
      ).set(
        'Accept', 'application/json'
      ).then(
        (response) => {
          dispatch({
            type: CAMPAIGNS_LOAD_SUCCESS,
            campaigns: response.body
          })
        }
      ).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.error.loadingData', 'error', 10, false))
        ).then(() => {
          dispatch({
            type: CAMPAIGNS_LOAD_ERROR,
            error: response.body
          })
        })
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    });
  }
}
