import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';
import { createCampaign } from '../actions/campaigns/create';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { injectIntl, intlShape } from 'react-intl';
import {validateCampaign} from '../components/common/campaignValidator';

@connect(
  state => ({}),
  (dispatch) => {
    return {
      handleCreateCampaign: () => {
        dispatch(createCampaign());
      },
      handleBackFromCreateForm: () => {
        dispatch(push({ pathname: '/' }))
      }
    }
  }
)
class CampaignCreate extends Component {

  static propTypes = {
    intl: intlShape.isRequired
  };

  static contextTypes = {
    currentUser: PropTypes.object.isRequired
  };

  render() {
    const { intl, handleCreateCampaign, handleBackFromCreateForm } = this.props;
    const { currentUser: { loginName } } = this.context;

    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "create",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.create.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.create' }),
      onSave: handleCreateCampaign,
      onCancel: handleBackFromCreateForm,
      initialValues: { owner: loginName }
    })(CampaignForm));
  }
}

export default injectIntl(CampaignCreate);


