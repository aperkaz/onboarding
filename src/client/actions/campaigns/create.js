import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import { CAMPAIGN_CREATE_START, CAMPAIGN_CREATE_SUCCESS, CAMPAIGN_CREATE_ERROR } from '../../constants/campaigns'
import { CAMPAIGN_FIELDS } from '../../constants/campaigns';
import { CREATE_CAMPAIGN_FORM } from '../../constants/forms'
import { showNotification, removeNotification } from '../notification';
import { prepareParams } from './utils';

const createFormValueSelector = formValueSelector(CREATE_CAMPAIGN_FORM);

export function createCampaign(router) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CREATE_START
      })
    ).then(() => {
      return request.post(`${getState().currentService.location}/api/campaigns`).set(
        'Accept', 'application/json'
      ).send(
        prepareParams(createFormValueSelector(
          getState(),
          ...CAMPAIGN_FIELDS
        ))
      ).then((response) => {
        let createdCampaign = response.body;
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.success.createCampaign', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CREATE_SUCCESS,
            newCampaign: createdCampaign
          });
          router.push(`/edit/${createdCampaign.campaignId}/template/email`);
        })
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.error.createCampaign', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CREATE_ERROR,
            error: response.body
          });
        });
      }).finally(() => {
        // removing all notifications or they will be left in 'notification queue'
        dispatch(removeNotification());
      });
    });
  }
}
