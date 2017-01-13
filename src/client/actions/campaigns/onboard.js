import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
//import { CAMPAIGN_SERVICE_NAME } from '../../constants/services';
import { ONBOARDING_CAMPAIGN_FORM } from '../../constants/forms'
import { ONBOARDING_CAMPAIGN_FIELDS } from '../../constants/campaigns';
import { prepareParams } from './utils';
import { showNotification, removeNotification } from '../notification';


const createFormValueSelector = formValueSelector(ONBOARDING_CAMPAIGN_FORM);

export function OnLoadCampaignPage(campaignId, contactId, transition) {
  return function(dispatch, getState) {
    return request.get(
      `${_.find(getState().serviceRegistry, {
          currentApplication: true
        }).location}/api/transition/${campaignId}/${contactId}?transition=${transition}`
    ).set('Accept', 'application/json').then((response) => {
      dispatch(showNotification('campaign.message.success.load'))
    }).catch((response) => {
      //dispatch(showNotification('campaign.message.error.load', 'error', 10))
    }).finally(() => {
      // removing all notifications or they will be left in 'notification queue' 
      dispatch(removeNotification());
    });
  }
}

export function Onboarding() {
  return function(dispatch, getState) {
    return request.post(`/api/onboarding`).set(
        'Accept', 'application/json'
      ).send(
        prepareParams(createFormValueSelector(
          getState(),
          ...ONBOARDING_CAMPAIGN_FIELDS
        ))
      ).then((response) => {
        dispatch(showNotification('campaign.message.success.onboard', 'success'))
      }).catch((response) => {
        dispatch(showNotification('campaign.message.error.onboard', 'error', 10))
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
  }
}
