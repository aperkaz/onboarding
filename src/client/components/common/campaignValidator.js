import _ from 'lodash';
import validate from 'validate.js';

/**
 * Constraint for campaign contacts
 * for validate.js
 */
const campaignConstraints = {
  campaignId: {
    presence: {
      message: () => {return "^campaignEditor.campaignForm.error.isRequired"}
    }
  },
  /* startsOn: {
    presence: {
      message: () => {return "^campaignEditor.campaignForm.error.isRequired"}
    }
  },*/
  campaignType: {
    presence: {
      message: () => {return "^campaignEditor.campaignForm.error.isRequired"}
    }
  },
  status: {
    presence: {
      message: () => {return "^campaignEditor.campaignForm.error.isRequired"}
    }
  }
};

/**
 * Formats validate.js' error to the next pattern
 *
 * @param contact
 * @returns errors {<fieldName>: "terrible error"}
 */
export const validateCampaign = (campaign) => {
  let validationResult = validate(campaign, campaignConstraints);
  return {
    ..._.mapValues({ ...validationResult }, (value) => (value[0]))
  }
};
