import _ from 'lodash';
import validate from 'validate.js';

/**
 * Constraint for campaign contacts
 * for validate.js
 */
const campaignConstraints = {
  campaignId: {
    presence: {
      message: () => {return "^campaignContactEditor.validation.message.required"}
    }
  },
  campaignType: {
    presence: {
      message: () => {return "^campaignContactEditor.validation.message.required"}
    }
  },
  status: {
    presence: {
      message: () => {return "^campaignContactEditor.validation.message.required"}
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
  const errors = {};
  let validationResult = validate(campaign, campaignConstraints);
  return {
    ..._.mapValues({...validationResult}, (value) => (value[0]))
  }
};
