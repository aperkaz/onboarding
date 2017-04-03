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

  setCookie(cname,cvalue,exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    location.assign("/ncc_onboard");
  }

  componentWillMount() {
    const { campaignId, contactId } = this.props.params;

    this.props.handleCampaignPageLoading(campaignId, contactId, this.props.location.query.transition);
  }

  render() {
    if (this.props.data.onboardingCampaignContact !== undefined) {
      // var data ={
      //   campaignId: this.props.params.campaignId,
      //   contactId : this.props.params.contactId,
      //   contactCompany: this.props.data.onboardingCampaignContact.contact.companyName,
      //   companyId: 'ncc',
      //   companyName: 'NCC Svenska AB',
      //   contactFirstName: this.props.data.onboardingCampaignContact.contact.contactFirstName,
      //   contactLastName: this.props.data.onboardingCampaignContact.contact.contactLastName,
      //   contactEmail: this.props.data.onboardingCampaignContact.contact.email,
      //   serviceName: 'test',
      //   vatIdentNo: this.props.data.onboardingCampaignContact.contact.vatIdentNo,
      //   taxIdentNo: this.props.data.onboardingCampaignContact.contact.taxIdentNo,
      //   commercialRegisterNo: this.props.data.onboardingCampaignContact.contact.commercialRegisterNo,
      //   dunsNo: this.props.data.onboardingCampaignContact.contact.dunsNo
      // }
      
      var data = {
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
      let stringObj = JSON.stringify(data);
      this.setCookie('CAMPAIGN_INFO', stringObj, 5)
    }

    const { intl, Onboarding } = this.props;
    

    return null
  }
}

export default injectIntl(CampaignPage);
