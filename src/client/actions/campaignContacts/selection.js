import { SELECT_CAMPAIGN_CONTACT, REMOVE_CAMPAIGN_CONTACT_SELECTION } from '../../constants/campaignContacts';

export function selectContact(campaignId, id) {
  return {
    type: SELECT_CAMPAIGN_CONTACT,
    id: id,
    campaignId: campaignId
  }
}

export function removeSelection() {
  return {
    type: REMOVE_CAMPAIGN_CONTACT_SELECTION
  }
}
