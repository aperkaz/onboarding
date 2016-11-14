import request from 'superagent-bluebird-promise';
import { CAMPAIGN_SERVICE_NAME } from '../constants/services'
import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START } from '../constants/campaigns'
import { CAMPAIGN_CREATE_START, CAMPAIGN_CREATE_SUCCESS, CAMPAIGN_CREATE_ERROR } from '../constants/campaigns'
import { CAMPAIGN_DELETE_START, CAMPAIGN_DELETE_SUCCESS, CAMPAIGN_DELETE_ERROR } from '../constants/campaigns';
import { SEARCH_CAMPAIGN_FORM, CREATE_CAMPAIGN_FORM } from '../constants/forms'
import { showNotification, removeNotification } from '../actions/notification';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';
import _ from 'lodash';

const searchFormValueSelector = formValueSelector(SEARCH_CAMPAIGN_FORM);
const createFormValueSelector = formValueSelector(CREATE_CAMPAIGN_FORM);

function prepareParams(params) {
  let result = { ...params };
  if (!_.isUndefined(params.startsOn) && !_.isNull(params.startsOn)) {
    result['startsOn'] = params.startsOn.toISOString()
  }
  if (!_.isUndefined(params.endsOn) && !_.isNull(params.endsOn)) {
    result['endsOn'] = params.endsOn.toISOString()
  }
  return result;
}

export function searchCampaigns() {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGNS_LOAD_START
      })
    ).then(() => {
      return Promise.resolve(
        dispatch(showNotification('Loading data...'))
      );
    }).then(() => {
      return request.get(`${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns`).query(
        prepareParams(
          searchFormValueSelector(
            getState(),
            'campaignId',
            'startsOn',
            'endsOn',
            'status',
            'campaignType',
            'owner'
          )
        )
      ).set(
        'Accept', 'application/json'
      ).then(
        (response) => {
          dispatch({
            type: CAMPAIGNS_LOAD_SUCCESS,
            campaigns: response.body
          })
        }
      ).catch((response) => dispatch({
        type: CAMPAIGNS_LOAD_ERROR,
        error: response
      }));
    });
  }
}

export function createCampaign() {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CREATE_START
      })
    ).then(() => {
      return request.post(`${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns`).set(
        'Accept', 'application/json'
      ).send(
        {
          ...createFormValueSelector(
            getState(),
            'campaignId',
            'description',
            'startsOn',
            'endsOn',
            'status',
            'campaignType',
            'owner'
          )
        }
      ).then((response) => {
        return Promise.resolve(
          dispatch(showNotification('Campaign successfully created', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CREATE_SUCCESS
          })
        })
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('Campaign creation error', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CREATE_ERROR,
            error: response
          })
        });
      });
    });
  }
}

export function deleteCampaign(campaignId) {
  return function(dispatch, getState) {
    return Promise.resolve(
      dispatch({
        type: CAMPAIGN_CREATE_START
      })
    ).then(() => {
      return request.del(
        `${getState().serviceRegistry(CAMPAIGN_SERVICE_NAME).url}/api/campaigns/${campaignId}`
      ).set('Accept', 'application/json').then((response) => {
        return Promise.resolve(
          dispatch(showNotification('Campaign successfully deleted', 'success'))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_DELETE_SUCCESS,
            campaignId: campaignId
          })
        });
      }).catch((response) => {
        return Promise.resolve(
          dispatch(showNotification('Campaign deleted failed', 'error', 10))
        ).then(() => {
          dispatch({
            type: CAMPAIGN_CREATE_ERROR,
            error: response
          });
        })
      })
    })
  }
}
