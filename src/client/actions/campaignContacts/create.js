import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import { CAMPAIGN_SERVICE_NAME } from '../../constants/services';
import {
  CAMPAIGN_CONTACT_CREATE_START,
  CAMPAIGN_CONTACT_CREATE_SUCCESS,
  CAMPAIGN_CONTACT_CREATE_ERROR
} from '../../constants/campaignContacts';
import { CAMPAIGN_CONTACT_FIELDS } from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';
import { CREATE_CAMPAIGN_CONTACT_FORM } from '../../constants/forms';

const createFormValueSelector = formValueSelector(CREATE_CAMPAIGN_CONTACT_FORM);

export function createContact(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_CREATE_START
      })
    ).then(() => {
      return request.post(
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}/contacts`
      ).set(
        'Accept', 'application/json'
      ).send(
        createFormValueSelector(
          getState(),
          ...CAMPAIGN_CONTACT_FIELDS
        )
      ).then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.success.createContact', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_CREATE_SUCCESS,
            contact: response.body
          });
        })
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.createContact', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_CREATE_ERROR,
            error: response.body
          });
        });
      }).finally(() => {
        //removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    });
  }
}
