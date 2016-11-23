import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';
import { updateCampaign } from '../actions/campaign';
import { reduxForm } from 'redux-form';
import { EDIT_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import {validateCampaign} from '../components/common/campaignValidator';
import {injectIntl, intlShape} from 'react-intl';

@connect(
  state => ({campaign: _.find(state.campaignList.campaigns, {campaignId: state.router.params.campaignId})}),
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
class CampaignEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const {handleUpdateCampaign, handleBackFromEditForm, campaign, intl} = this.props;

    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "update",
      formLabel: intl.formatMessage({id: 'campaignEditor.campaignForm.edit.header'}),
      submitButtonLabel: intl.formatMessage({id: 'campaignEditor.campaignForm.button.update'}),
      onSave: () => {handleUpdateCampaign(campaign.campaignId)},
      onCancel: handleBackFromEditForm,
      initialValues: campaign
    })(CampaignForm));
  }
}

export default injectIntl(CampaignEdit);

