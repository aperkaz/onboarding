import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import {
  CAMPAIGN_CONTACTS_LOAD_START,
  CAMPAIGN_CONTACTS_LOAD_SUCCESS,
  CAMPAIGN_CONTACTS_LOAD_ERROR
} from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';
import _ from 'lodash';

export function loadCampaignContacts(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACTS_LOAD_START
      })
    ).then(() => {
      return Promise.resolve(
        dispatch(showNotification('campaignContactEditor.message.info.loadingData'))
      );
    }).then(() => {
      return request.get(
        `${_.find(getState().serviceRegistry, {
          currentApplication: true
        }).location}/api/campaigns/${campaignId}/contacts`
      ).set(
        'Accept', 'application/json'
      ).then(
        (response) => {
          dispatch({
            type: CAMPAIGN_CONTACTS_LOAD_SUCCESS,
            campaignContacts: response.body
          })
        }
      ).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.loadingData', 'error', 10, false))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACTS_LOAD_ERROR,
            error: response.body
          })
        })
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    })
  }
}
