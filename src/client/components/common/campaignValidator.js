import _ from 'lodash';

const validateCampaign = (campaign) => {
  const errors = {};
  if (_.size(campaign.campaignId) <= 0) {
    errors.campaignId = 'campaignEditor.campaignForm.campaignId.error.isRequired'
  }
  return errors;
};

export default validateCampaign;
