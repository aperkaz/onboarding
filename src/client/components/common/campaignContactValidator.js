import validate from 'validate.js';
import _ from 'lodash';

/**
 * Constraint for campaign contacts
 * for validate.js
 */
const campaignContactConstraints = {
  email: {
    email: {
      message: () => {return "^campaignContactEditor.contactForm.email.error.emailFormat"}
    }
  },
  campaignId: {
    presence: {
      message: () => {return "^campaignContactEditor.contactForm.error.required"}
    }
  },
  companyName: {
    presence: {
      message: () => {return "^campaignContactEditor.contactForm.error.required"}
    }
  },
  contactFirstName: {

  },
  contactLastName: {
    
  }
};

/**
 * Formats validate.js' error to the next pattern
 *
 * @param contact
 * @returns errors {<fieldName>: "terrible error"}
 */
export const validateCampaignContact = (contact) => {
  let validationResult = validate(contact, campaignContactConstraints);
  return {
    ..._.mapValues({ ...validationResult }, (value) => (value[0]))
  }
};
