import request from 'superagent-bluebird-promise';
import { CAMPAIGN_SERVICE_NAME } from '../constants/services';
import {
  CAMPAIGN_CONTACTS_LOAD_START,
  CAMPAIGN_CONTACTS_LOAD_SUCCESS,
  CAMPAIGN_CONTACTS_LOAD_ERROR
} from '../constants/campaignContacts';
import {
  CAMPAIGN_CONTACT_UPDATE_START,
  CAMPAIGN_CONTACT_UPDATE_SUCCESS,
  CAMPAIGN_CONTACT_UPDATE_ERROR
} from '../constants/campaignContacts';
import {
  CAMPAIGN_CONTACT_CREATE_START,
  CAMPAIGN_CONTACT_CREATE_SUCCESS,
  CAMPAIGN_CONTACT_CREATE_ERROR
} from '../constants/campaignContacts';
import {
  CAMPAIGN_CONTACT_DELETE_START,
  CAMPAIGN_CONTACT_DELETE_SUCCESS,
  CAMPAIGN_CONTACT_DELETE_ERROR
} from '../constants/campaignContacts';
import { CAMPAIGN_CONTACT_FIELDS } from '../constants/campaignContacts';
import { SELECT_CAMPAIGN_CONTACT, REMOVE_CAMPAIGN_CONTACT_SELECTION } from '../constants/campaignContacts';
import { EDIT_CAMPAIGN_CONTACT_FORM, CREATE_CAMPAIGN_CONTACT_FORM } from '../constants/forms'
import { showNotification, removeNotification } from '../actions/notification';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';

const editFormValueSelector = formValueSelector(EDIT_CAMPAIGN_CONTACT_FORM);
const createFormValueSelector = formValueSelector(CREATE_CAMPAIGN_CONTACT_FORM);

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
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}/contacts`
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
        //removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    })
  }
}

export function updateContact(campaignId, email) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_UPDATE_START
      })
    ).then(() => {
      return request.put(
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}/contacts/${email}`
      ).set(
        'Accept', 'application/json'
      ).send(
        editFormValueSelector(
          getState(),
          ...CAMPAIGN_CONTACT_FIELDS
        )
      ).then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.success.updateContact', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_UPDATE_SUCCESS,
            contact: response.body
          })
        })
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.error.updateContact', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CONTACT_UPDATE_ERROR,
            error: response.body
          })
        });
      }).finally(() => {
        //removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    });
  }
}

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
          dispatch(showNotification('campaignEditor.message.error.createContact', 'error', 10))
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

export function deleteContact(campaignId, email) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACT_DELETE_START
      })
    ).then(() => {
      return request.del(
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}/contacts/${email}`
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
        //removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    })
  }
}

/**
 * If both campaignId and email exist - we select existing contact for editing
 * If only campaignId is defined - we 'select' object {campaignId: <campaignId>} - a blueprint for a new contact
 */
export function selectContact(campaignId, email) {
  return {
    type: SELECT_CAMPAIGN_CONTACT,
    email: email,
    campaignId: campaignId
  }
}

export function removeSelection() {
  return {
    type: REMOVE_CAMPAIGN_CONTACT_SELECTION
  }
}
