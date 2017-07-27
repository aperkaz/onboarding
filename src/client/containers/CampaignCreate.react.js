import { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { intlShape } from 'react-intl';
import { validateCampaign } from '../components/common/campaignValidator';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import campaignsType from '../../utils/workflowConstant.js';

@connect(
  state => ({
    currentUserData: state.currentUserData
  }),
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
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const serviceRegistry = (service) => ({ url: '/isodata' });
    this.LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
    this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });
  }

  render() {
    const { intl, handleCreateCampaign, onBack } = this.props;
    const { CountryField } = this.CountryField;
    const { LanguageField } = this.LanguageField;
    const { currentUserData: { id } } = this.props;
    const workflowTypes = campaignsType.getWorkflowTypes();

    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "create",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.create.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.create' }),
      onSave: handleCreateCampaign.bind(null, this.context.router),
      onCancel: onBack,
      initialValues: { owner: id, status: 'new', campaignType: workflowTypes[0] },
      campaigntype: workflowTypes,
      CountryField: CountryField,
      LanguageField: LanguageField
    })(CampaignForm));
  }
}
