import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';
import { updateCampaign } from '../actions/campaign';
import { reduxForm } from 'redux-form';
import { EDIT_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import _ from 'lodash';

const validate = (values) => {
  const errors = {};
  if (_.size(values.campaignId) <= 0) {
    errors.campaignId = 'Required'
  }
  return errors;
};


@connect(
  state => ({campaign: _.find(state.campaign.campaigns, {campaignId: state.router.params.campaignId})}),
  (dispatch) => {
    return {
      handleUpdateCampaign: (campaignId) => {
        dispatch(updateCampaign(campaignId))
      },
      handleBackFromEditForm: () => {
        dispatch(push({ pathname: '/' }))
      }
    }
  }
)
export default class CampaignEdit extends Component {
  render() {
    const {handleUpdateCampaign, handleBackFromEditForm, campaign} = this.props;
    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_FORM,
      validate,
      mode: "update",
      formLabel: "Edit Campaign",
      submitButtonLabel: "Update",
      onSave: () => {handleUpdateCampaign(campaign.campaignId)},
      onCancel: handleBackFromEditForm,
      initialValues: campaign
    })(CampaignForm));
  }
}


