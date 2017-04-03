import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import {
  CAMPAIGN_CONTACT_DELETE_START,
  CAMPAIGN_CONTACT_DELETE_SUCCESS,
  CAMPAIGN_CONTACT_DELETE_ERROR
} from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';

export function deleteContact(campaignId, email) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_DELETE_START
      })
    ).then(() => {
      return request.del(
        `${getState().currentService.location}/api/campaigns/${campaignId}/contacts/${email}`
      ).set('Accept', 'application/json').then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.success.deleteContact', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_DELETE_SUCCESS,
            campaignId: campaignId,
            email: email
          })
        });
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.deleteContact', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_DELETE_ERROR,
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
