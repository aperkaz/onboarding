import {
    CAMPAIGNS_LOAD_START,
    CAMPAIGNS_LOAD_SUCCESS,
    CAMPAIGNS_LOAD_ERROR
} from '../constants/campaigns';

//State of Campaign reducer:
// {
//     campaigns: [],
//     error: {},
//     loading: true / false
// }

export default function campaign(state = {}, action) {
    switch (action.type) {
        case CAMPAIGNS_LOAD_START:
            return {
                ...state,
                loading: true
            };
        case CAMPAIGNS_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                campaigns: action.campaigns
            };
        case CAMPAIGNS_LOAD_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        default:
            return state;
    }
}