import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import { CAMPAIGN_STARTING_START, CAMPAIGN_STARTING_SUCCESS, CAMPAIGN_STARTING_ERROR } from '../../constants/campaigns';
import { showNotification, removeNotification } from '../notification';

const startCampaign = (campaignId) => (dispatch, getState) => {
  return Promise.resolve(() => dispatch({ type: CAMPAIGN_STARTING_START }))
    .then(() => {
      return request.put(`${getState().currentService.location}/api/campaigns/start/${campaignId}`)
        .set('Accept', 'application/json')
        .promise();
    })
    .then((response) => {
      dispatch(showNotification('campaign.message.success.start', 'success'));
      dispatch({
        type: CAMPAIGN_STARTING_SUCCESS,
        campaign: response.body
      });
    })
    .catch((response) => {
      dispatch(showNotification('campaign.message.error.start', 'error', 10));
      dispatch({
        type: CAMPAIGN_STARTING_ERROR,
        error: response.body
      });
    })
    .finally(() => {
      // removing all notifications or they will be left in 'notification queue'
      dispatch(removeNotification());
    });
};

export { startCampaign };
