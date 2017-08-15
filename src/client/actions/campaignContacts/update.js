import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import {
  CAMPAIGN_CONTACT_UPDATE_START,
  CAMPAIGN_CONTACT_UPDATE_SUCCESS,
  CAMPAIGN_CONTACT_UPDATE_ERROR
} from '../../constants/campaignContacts';
import { CAMPAIGN_CONTACT_FIELDS } from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';
import { EDIT_CAMPAIGN_CONTACT_FORM } from '../../constants/forms';
import { ifValidBodyAndType } from '../../store/middleware/redirectToLogin';

const editFormValueSelector = formValueSelector(EDIT_CAMPAIGN_CONTACT_FORM);

export function updateContact(campaignId, contactId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_UPDATE_START
      })
    ).then(() => {
      return request.put(
        `${getState().currentService.location}/api/campaigns/${campaignId}/contacts/${contactId}`
      ).set(
        'Accept', 'application/json'
      ).send(
        editFormValueSelector(
          getState(),
          ...CAMPAIGN_CONTACT_FIELDS
        )
      )
      .then(ifValidBodyAndType)
      .then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.success.updateContact', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_UPDATE_SUCCESS,
            contact: response.body
          })
        })
      }).catch((error) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.updateContact', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_UPDATE_ERROR,
            error: error.body,
            statusCode: error.code
          })
        });
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    });
  }
}
