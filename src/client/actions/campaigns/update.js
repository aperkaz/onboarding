import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import { CAMPAIGN_UPDATE_START, CAMPAIGN_UPDATE_SUCCESS, CAMPAIGN_UPDATE_ERROR } from '../../constants/campaigns';
import { CAMPAIGN_FIELDS } from '../../constants/campaigns';
import { EDIT_CAMPAIGN_FORM } from '../../constants/forms';
import { showNotification, removeNotification } from '../../actions/notification';
import { ifValidBodyAndType } from '../../store/middleware/redirectToLogin';
import { prepareParams } from './utils';

const editFormValueSelector = formValueSelector(EDIT_CAMPAIGN_FORM);

export function updateCampaign(campaignId, router) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_UPDATE_START
      })
    ).then(() => {
      return request.put(`${getState().currentService.location}/api/campaigns/${campaignId}`).set(
        'Accept', 'application/json'
      ).send(
        prepareParams(editFormValueSelector(
          getState(),
          ...CAMPAIGN_FIELDS
        ))
      )
      .then(ifValidBodyAndType)
      .then((response) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.success.updateCampaign', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_UPDATE_SUCCESS
          })
          router.push(`/edit/${campaignId}/contacts`);
        })
      }).catch((error) => {
        return Promise.resolve(
          dispatch(showNotification('campaignEditor.message.error.updateCampaign', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_UPDATE_ERROR,
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
