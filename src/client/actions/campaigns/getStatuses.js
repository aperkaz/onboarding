import { CAMPAIGNS_STATS_LOAD_SUCCESS } from '../../constants/campaignStats';
import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';

export function getStatuses() {
    return (dispatch, getState) => {
        return request.get(
            `${getState().currentService.location}/api/stats/campaigns`
        ).set('Accept', 'application/json').then((response) => {
        dispatch({
          type: CAMPAIGNS_STATS_LOAD_SUCCESS,
          campaigns: response.body
        })
      });
    }
}