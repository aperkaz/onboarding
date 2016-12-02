import { reducer } from 'redux-form';
import { CAMPAIGN_CREATE_ERROR } from '../constants/campaigns'
import { CAMPAIGN_CONTACT_CREATE_ERROR } from '../constants/campaignContacts'
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import { CREATE_CAMPAIGN_CONTACT_FORM } from '../constants/forms';

// we extends default redux-form reducer for redux-way server-error handling
const formReducer = reducer.plugin(
  {
    [CREATE_CAMPAIGN_FORM]: (state, action) => {
      switch (action.type) {
        case CAMPAIGN_CREATE_ERROR:
          return {
            ...state,
            fields: {
              ...state.fields,
              campaignId: {
                ...state.fields.campaignId,
                touched: true
              }
            },
            syncErrors: {
              campaignId: "campaignEditor.campaignForm.error.unique"
            }
          };
        default:
          return state
      }
    },
    [CREATE_CAMPAIGN_CONTACT_FORM]: (state, action) => {
      switch (action.type) {
        case CAMPAIGN_CONTACT_CREATE_ERROR:
          return {
            ...state,
            fields: {
              ...state.fields,
              campaignId: {
                ...state.fields.email,
                touched: true
              }
            },
            syncErrors: {
              email: "campaignContactEditor.contactForm.error.unique"
            }
          };
        default:
          return state
      }
    }
  }
);

export default formReducer;
