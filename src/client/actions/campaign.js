import request from 'superagent-bluebird-promise';
import { CAMPAIGN_SERVICE_NAME } from '../constants/services'
import { CAMPAIGNS_LOAD_ERROR, CAMPAIGNS_LOAD_SUCCESS, CAMPAIGNS_LOAD_START } from '../constants/campaigns'
import { CAMPAIGN_CREATE_START, CAMPAIGN_CREATE_SUCCESS, CAMPAIGN_CREATE_ERROR } from '../constants/campaigns'
import { SEARCH_CAMPAIGN_FORM, CREATE_CAMPAIGN_FORM } from '../constants/forms'
import { showNotification, removeNotification } from '../actions/notification';
import Promise from 'bluebird';
import { formValueSelector } from 'redux-form';

const searchFormValueSelector = formValueSelector(SEARCH_CAMPAIGN_FORM);
const createFormValueSelector = formValueSelector(CREATE_CAMPAIGN_FORM);

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
                {
                    ...searchFormValueSelector(
                        getState(),
                        'campaignId',
                        'status',
                        'campaignType',
                        'owner'
                    )
                }
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
                    dispatch(showNotification('Campaign successfully created'))
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