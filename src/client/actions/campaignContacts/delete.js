import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import {
  CAMPAIGN_CONTACT_DELETE_START,
  CAMPAIGN_CONTACT_DELETE_SUCCESS,
  CAMPAIGN_CONTACT_DELETE_ERROR
} from '../../constants/campaignContacts';
import { ifValidBodyAndType } from '../../store/middleware/redirectToLogin';
import { showNotification, removeNotification } from '../notification';

export function deleteContact(campaignId, contactId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_DELETE_START
      })
    ).then(() => {
      return request.del(
        `${getState().currentService.location}/api/campaigns/${campaignId}/contacts/${contactId}`
      ).set('Accept', 'application/json')
      .then(ifValidBodyAndType)
      .then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.success.deleteContact', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_DELETE_SUCCESS,
            campaignId: campaignId,
            contactId: contactId
          })
        });
      }).catch((error) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.deleteContact', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_DELETE_ERROR,
            error: error.body,
            statusCode: error.code
          });
        })
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    })
  }
}
