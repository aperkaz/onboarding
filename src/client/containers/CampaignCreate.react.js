import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';
import { createCampaign } from '../actions/campaign';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
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
  state => ({}),
  (dispatch) => {
    return {
      handleCreateCampaign: () => {
        dispatch(createCampaign())
      },
      handleBackFromCreateForm: () => {
        dispatch(push({ pathname: '/' }))
      }
    }
  }
)
export default class CampaignCreate extends Component {
  render() {
    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_FORM,
      validate,
      mode: "create",
      formLabel: "Create Campaign",
      submitButtonLabel: "Create",
      onSave: this.props.handleCreateCampaign,
      onCancel: this.props.handleBackFromCreateForm
    })(CampaignForm));
  }
}


