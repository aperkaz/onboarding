import { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { injectIntl, intlShape } from 'react-intl';
import { validateCampaign } from '../components/common/campaignValidator';
import  campaignsType from '../../utils/workflowConstant.js';

@connect(
  state => ({}),
  (dispatch) => {
    return {
      handleCreateCampaign: function(router) {
        dispatch(createCampaign(router));
      }
    }
  }
)
export default class CampaignCreate extends Component {

  static propTypes = {
    intl: intlShape.isRequired,
    handleCreateCampaign: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    params: PropTypes.object
  };

  static contextTypes = {
    currentUserInfo: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  render() {
    const { intl, handleCreateCampaign } = this.props;
    const { currentUserInfo: { username } } = this.context;

    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "create",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.create.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.create' }),
      onSave: handleCreateCampaign.bind(null, this.context.router),
      onCancel: ::this.props.handleBack,
      initialValues: { owner: username, status: 'new' },
      campaigntype: campaignsType.getWorkflowTypes()
    })(CampaignForm));
  }
}
