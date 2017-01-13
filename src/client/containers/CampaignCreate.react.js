import { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { injectIntl, intlShape } from 'react-intl';
import { validateCampaign } from '../components/common/campaignValidator';

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
class CampaignCreate extends Component {

  static propTypes = {
    intl: intlShape.isRequired,
    handleCreateCampaign: PropTypes.func.isRequired
  };

  static contextTypes = {
    currentUserInfo: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  handleBackFromCreateForm() {
    this.context.router.push('/campaigns');
  }

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
      onCancel: ::this.handleBackFromCreateForm,
      initialValues: { owner: username }
    })(CampaignForm));
  }
}

export default injectIntl(CampaignCreate);
