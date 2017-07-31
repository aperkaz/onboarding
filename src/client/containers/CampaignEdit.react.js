import { Component, createElement, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateCampaign } from '../actions/campaigns/update';
import { findCampaign } from '../actions/campaigns/find';
import { reduxForm } from 'redux-form';
import {loadCampaignContacts} from '../'
import { EDIT_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { validateCampaign } from '../components/common/campaignValidator';
import { intlShape } from 'react-intl';
import campaignsType from '../../utils/workflowConstant.js';

@connect(
  state => ({
    campaignList: state.campaignList
  }),
  (dispatch) => ({
    handleUpdateCampaign: (campaignId, router) => {
      dispatch(updateCampaign(campaignId, router))
    },
    handleFindCampaign: (campaignId) => {
      dispatch(findCampaign(campaignId));
    }
  })
)
export default class CampaignEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleUpdateCampaign: PropTypes.func.isRequired,
    handleFindCampaign: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    params: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.campaign = null;
  }

  componentWillMount() {
    this.setCampaign(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setCampaign(nextProps);
    this.props = nextProps;
  }
  componentDidMount() {
    this.setCampaign(this.props)
    //this.props.handleFindCampaign(this.props.params.campaignId);
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
    const { handleUpdateCampaign, intl: { formatMessage }, onBack } = this.props;

    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_FORM,
      validate: validateCampaign,
      mode: "update",
      formLabel: formatMessage({ id: 'campaignEditor.campaignForm.edit.header' }),
      submitButtonLabel: formatMessage({ id: 'campaignEditor.campaignForm.button.update' }),
      onSave: () => handleUpdateCampaign(this.campaign.campaignId, this.context.router),
      onCancel: onBack,
      initialValues: this.campaign,
      campaigntype: campaignsType.getWorkflowTypes()
    })(CampaignForm));
  }
}
