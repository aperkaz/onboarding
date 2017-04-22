import { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { intlShape } from 'react-intl';
import { validateCampaign } from '../components/common/campaignValidator';
import campaignsType from '../../utils/workflowConstant.js';

@connect(
  state => ({}),
  (dispatch) => ({
    handleCreateCampaign: (router) => dispatch(createCampaign(router))
  })
)
export default class CampaignCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleCreateCampaign: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    params: PropTypes.object
  };

  static contextTypes = {
    currentUserData: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  render() {
    const { intl, handleCreateCampaign, onBack } = this.props;
    const { currentUserData: { username } } = this.context;

    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "create",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.create.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.create' }),
      onSave: handleCreateCampaign.bind(null, this.context.router),
      onCancel: onBack,
      initialValues: { owner: username, status: 'new' },
      campaigntype: campaignsType.getWorkflowTypes()
    })(CampaignForm));
  }
}
