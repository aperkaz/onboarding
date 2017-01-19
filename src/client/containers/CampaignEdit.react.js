import { Component, createElement, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateCampaign } from '../actions/campaigns/update';
import { findCampaign } from '../actions/campaigns/find';
import { reduxForm } from 'redux-form';
import { EDIT_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { validateCampaign } from '../components/common/campaignValidator';
import { injectIntl, intlShape } from 'react-intl';
import  campaignsType from '../../utils/workflowConstant.js';

@connect(
  state => (
    {
      campaignList: state.campaignList
    }),
  (dispatch) => {
    return {
      handleUpdateCampaign: (campaignId, router) => {
        dispatch(updateCampaign(campaignId, router))
      },
      handleFindCampaign: (campaignId) => {
        dispatch(findCampaign(campaignId));
      }
    }
  }
)
export default class CampaignEdit extends Component {
  constructor(props) {
    super(props);

    this.campaign = null;
  }
  static propTypes = {
    intl: intlShape.isRequired,
    handleUpdateCampaign: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    params: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.setCampaign(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setCampaign(nextProps);
    this.props = nextProps;
  }

  setCampaign = (props) => {
    if (props.campaignList && props.campaignList.campaigns) {
      this.campaign = _.find(props.campaignList.campaigns, {
        campaignId: props.params.campaignId
      });
    } else if (!props.campaignList.loading && !props.campaignList.error) {
      this.props.handleFindCampaign(this.props.params.campaignId);
    }
  }

  render() {
    const { handleUpdateCampaign, intl } = this.props;

    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "update",
      formLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.edit.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignEditor.campaignForm.button.update' }),
      onSave: () => {
        handleUpdateCampaign(this.campaign.campaignId, this.context.router)
      },
      onCancel: ::this.props.handleBack,
      initialValues: this.campaign,
      campaigntype: campaignsType.getWorkflowTypes()
    })(CampaignForm));
  }
}
