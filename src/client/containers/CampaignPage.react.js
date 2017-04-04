/* eslint-disable react/prop-types */

import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { onLoadCampaignPage } from '../actions/campaigns/onboard';
import { injectIntl } from 'react-intl';

@connect(
  state => ({ data: state.campaignList }),
  (dispatch) => {
    return {
      handleCampaignPageLoading: (campaignId, contactId, transition) => {
        dispatch(onLoadCampaignPage(campaignId, contactId, transition));
      }
    }
  }
)

class CampaignPage extends Component {
  static propTypes = {
    handleCampaignPageLoading: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  setdata(onboardingData) {
    const userDetail = JSON.stringify(onboardingData.userDetail);
    const tradingPartnerDetails = JSON.stringify(onboardingData.tradingPartnerDetails);
    location.assign(`/onboarding/ncc_onboard?userDetail=${userDetail}&tradingPartnerDetails=${tradingPartnerDetails}`);
  }

  componentWillMount() {
    const { campaignId, contactId } = this.props.params;

    this.props.handleCampaignPageLoading(campaignId, contactId, this.props.location.query.transition);
  }

  render() {
    if (this.props.data.onboardingCampaignContact !== undefined) {
      let onboardingData = {
        userDetail: {
          contactId : this.props.params.contactId,
          email: this.props.data.onboardingCampaignContact.contact.email,
          firstName: this.props.data.onboardingCampaignContact.contact.contactFirstName,
          lastName: this.props.data.onboardingCampaignContact.contact.contactLastName,
          campaignId: this.props.params.campaignId,
          serviceName: 'test service'
        },       
        tradingPartnerDetails: {
          name: 'NCC Svenska AB',
          vatIdentNo: this.props.data.onboardingCampaignContact.contact.vatIdentNo,
          taxIdentNo: this.props.data.onboardingCampaignContact.contact.taxIdentNo,
          dunsNo: this.props.data.onboardingCampaignContact.contact.dunsNo,
          commercialRegisterNo: this.props.data.onboardingCampaignContact.contact.commercialRegisterNo,
          city: this.props.data.onboardingCampaignContact.contact.city,
          country: this.props.data.onboardingCampaignContact.contact.country
        }
      }
      this.setdata(onboardingData)
    }
    return null
  }
}

export default injectIntl(CampaignPage);
