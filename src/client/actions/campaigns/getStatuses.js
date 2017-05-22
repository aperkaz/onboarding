import request from 'superagent-bluebird-promise';
import Promise from 'bluebird';

export function getStatuses() {
    return (dispatch, getState) => {
        return request.get(
            `${getState().currentService.location}/campaigns/1` //`${tenant}`
        ).set('Accept', 'application/json').then((response) => {
        dispatch({
          type: "TEST_CASE",
          campaigns: response.body
        })
      });
    }
}