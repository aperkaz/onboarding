import {
  CAMPAIGN_CONTACTS_LOAD_START,
  CAMPAIGN_CONTACTS_LOAD_SUCCESS,
  CAMPAIGN_CONTACTS_LOAD_ERROR
} from '../constants/campaignContacts';
import {
  CAMPAIGN_CONTACTS_IMPORT_START,
  CAMPAIGN_CONTACTS_IMPORT_SUCCESS,
  RESET_IMPORT_INFO
} from '../constants/campaignContacts';
import { SELECT_CAMPAIGN_CONTACT, REMOVE_CAMPAIGN_CONTACT_SELECTION } from '../constants/campaignContacts';
import { CAMPAIGN_CONTACT_UPDATE_SUCCESS } from '../constants/campaignContacts';
import { CAMPAIGN_CONTACT_CREATE_SUCCESS } from '../constants/campaignContacts';
import { CAMPAIGN_CONTACT_DELETE_SUCCESS } from '../constants/campaignContacts';
import _ from 'lodash';

/**
 * State of Campaign reducer:
 * {
 *     campaignContacts: [],
 *     error: {},
 *     selectedContact: {...}
 *     loading: true / false,
 *     importInProgress: true/false
 *     importResult: {failed: <n>, created: <k>, updated: <l>} n,k,l - numbers
 * }
 */
export default function campaignContactList(state = {}, action) {
  switch (action.type) {
    case CAMPAIGN_CONTACTS_LOAD_START:
      return {
        ...state,
        loading: true
      };
    case CAMPAIGN_CONTACTS_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        campaignContacts: action.campaignContacts
      };
    case CAMPAIGN_CONTACTS_LOAD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case SELECT_CAMPAIGN_CONTACT: // use this state for selecting existing contact and initiating creating new one
      let selectedContact = _.find(state.campaignContacts, { campaignId: action.campaignId, id: action.id });
      return {
        ...state,
        selectedContact: _.isEmpty(selectedContact) ? { campaignId: action.campaignId } : selectedContact
      };
    case REMOVE_CAMPAIGN_CONTACT_SELECTION:
      return {
        ...state,
        selectedContact: undefined
      };
    case CAMPAIGN_CONTACT_UPDATE_SUCCESS:
      let updatedContacts = _.cloneDeep(state.campaignContacts);
      let updatedContactIdx = _.findIndex(updatedContacts, {
        campaignId: action.contact.campaignId,
        id: action.contact.id,
      });
      updatedContacts[updatedContactIdx] = action.contact;
      return {
        ...state,
        campaignContacts: updatedContacts,
        selectedContact: action.contact
      };
    case CAMPAIGN_CONTACT_CREATE_SUCCESS:
      return {
        ...state,
        selectedContact: action.contact,
        campaignContacts: _.concat(state.campaignContacts, action.contact)
      };
    case CAMPAIGN_CONTACT_DELETE_SUCCESS:
      return {
        ...state,
        selectedContact: undefined,
        campaignContacts: _.reject(state.campaignContacts, { campaignId: action.campaignId, id: action.contactId })
      };
    case CAMPAIGN_CONTACTS_IMPORT_START:
      return {
        ...state,
        importInProgress: true
      };
    case CAMPAIGN_CONTACTS_IMPORT_SUCCESS:
      return {
        ...state,
        importInProgress: false,
        importResult: action.importResult
      };
    case RESET_IMPORT_INFO:
      return {
        ...state,
        importInProgress: undefined,
        importResult: undefined
      };
    default:
      return state
  }
}
