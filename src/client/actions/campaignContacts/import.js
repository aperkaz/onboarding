import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGN_SERVICE_NAME } from '../../constants/services';
import {
  CAMPAIGN_CONTACTS_IMPORT_START,
  CAMPAIGN_CONTACTS_IMPORT_SUCCESS,
  CAMPAIGN_CONTACTS_IMPORT_ERROR,
  RESET_IMPORT_INFO
} from '../../constants/campaignContacts';
import { showNotification, removeNotification } from '../notification';
import { loadCampaignContacts } from './load';

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
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}/contacts/import`
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
          return new Promise.resolve(
            dispatch(loadCampaignContacts(campaignId))
          )
        }
      })
    }).catch((response) => {
      return Promise.resolve(
        dispatch({
          type: CAMPAIGN_CONTACTS_IMPORT_ERROR
        })
      )
    })
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
