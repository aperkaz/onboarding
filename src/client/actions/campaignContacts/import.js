import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import {
  CAMPAIGN_CONTACTS_IMPORT_START,
  CAMPAIGN_CONTACTS_IMPORT_SUCCESS,
  CAMPAIGN_CONTACTS_IMPORT_ERROR,
  RESET_IMPORT_INFO
} from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';
import { loadCampaignContacts } from './load';
import _ from 'lodash';

export function importCampaignContacts(campaignId, contacts) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CONTACTS_IMPORT_START
      })
    ).then(() => {
      return Promise.resolve(
        dispatch(showNotification('campaignContactEditor.message.info.importingData'))
      );
    }).then(() => {
      return request.post(
        `${_.find(getState().serviceRegistry, {
          currentApplication: true
        }).location}/api/campaigns/${campaignId}/contacts/import`
      ).set(
        'Accept', 'application/json'
      ).send({ contacts })
    }).then((response) => {
      return Promise.resolve(
        dispatch({
          type: CAMPAIGN_CONTACTS_IMPORT_SUCCESS,
          importResult: response.body
        })
      ).then(() => {
        return Promise.resolve(
          dispatch(showNotification('campaignContactEditor.message.info.importDataSuccess', 'success'))
        );
      }).then(() => {
        if (response.body.created > 0 || response.body.updated > 0) {
          return Promise.resolve(
            dispatch(loadCampaignContacts(campaignId))
          )
        } else {
          return Promise.resolve();
        }
      })
    }).catch((response) => {
      return Promise.resolve(
        dispatch({
          type: CAMPAIGN_CONTACTS_IMPORT_ERROR
        })
      )
    }).finally(() => {
      // removing all notifications or they will be left in 'notification queue'
      dispatch(removeNotification());
    });
  }
}

/**
 * Resets import info in campaignCOntact list reducer (removes {importInProgress, importResult} props)
 * @return {{type}}
 */
export function resetImportInfo() {
  return {
    type: RESET_IMPORT_INFO
  }
}
