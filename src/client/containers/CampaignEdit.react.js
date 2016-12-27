import { Component, createElement, PropTypes } from 'react';
import { connect } from 'react-redux';
import browserHistory from 'react-router/lib/browserHistory';
import { updateCampaign } from '../actions/campaigns/update';
import { reduxForm } from 'redux-form';
import { EDIT_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { validateCampaign } from '../components/common/campaignValidator';
import { injectIntl, intlShape } from 'react-intl';

@connect(
  state => (
  {
    campaignList: state.campaignList
  }),
  (dispatch) => {
    return {
      handleUpdateCampaign: (campaignId) => {
        dispatch(updateCampaign(campaignId))
      },
      handleBackFromEditForm: () => {
        browserHistory.push('/campaigns');
      }
    }
  }
)
class CampaignEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleUpdateCampaign: PropTypes.func.isRequired,
    handleBackFromEditForm: PropTypes.func.isRequired,
    campaignList: PropTypes.object.isRequired,
  };

  render() {
    const campaign = _.find(this.props.campaignList.campaigns, {
      campaignId: this.props.params.campaignId
    });
    const { handleUpdateCampaign, handleBackFromEditForm, intl } = this.props;

    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "update",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.edit.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.update' }),
      onSave: () => {
        handleUpdateCampaign(campaign.campaignId)
      },
      onCancel: handleBackFromEditForm,
      initialValues: campaign
    })(CampaignForm));
  }
}

export default injectIntl(CampaignEdit);

