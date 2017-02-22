import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { OnLoadCampaignPage, Onboarding } from '../actions/campaigns/onboard';
import OnboardingCampaign from '../components/OnboardingCampaign.react';
import { ONBOARDING_CAMPAIGN_FORM } from '../constants/forms';
import { injectIntl, intlShape } from 'react-intl';

@connect(
  state => ({data: state.campaignList}),
  (dispatch) => {
    return {
      handleCampaignPageLoading: (campaignId, contactId, transition) => {
        dispatch(OnLoadCampaignPage(campaignId, contactId, transition));
      },
      Onboarding: () => {
        dispatch(Onboarding());
      }
    }
  }
)

class CampaignPage extends Component {
  static propTypes = {
    handleCampaignPageLoading: PropTypes.func.isRequired,
    Onboarding: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    location.assign("/campaigns/ncc_onboard");
  }
  componentWillMount() {
    this.props.handleCampaignPageLoading(this.props.params.campaignId, this.props.params.contactId, this.props.location.query.transition);
  }




  render() {
    if (this.props.data.onboardingCampaignContact !== undefined) {
      var data ={
        campaignId: this.props.params.campaignId,
        contactId : this.props.params.contactId,
        contactCompany: this.props.data.onboardingCampaignContact.contact.companyName,
        companyId: 'ncc',
        companyName: 'NCC Svenska AB',
        contactFirstName: this.props.data.onboardingCampaignContact.contact.contactFirstName,
        contactLastName: this.props.data.onboardingCampaignContact.contact.contactLastName,
        contactEmail: this.props.data.onboardingCampaignContact.contact.email,
        serviceName: ''
      }
      var stringObj = JSON.stringify(data);
      this.setCookie('CAMPAIGN_INFO', stringObj, 5)
    }

    const { intl, Onboarding } = this.props;
    /*return createElement(reduxForm({
      form: ONBOARDING_CAMPAIGN_FORM,
      fields: ['campaignId', 'contactId', 'transition'],
      initialValues: {
        transition: 'onboarded',
        campaignId: this.props.params.campaignId,
        contactId: this.props.params.contactId
      },
      onSave: Onboarding

    })(OnboardingCampaign));*/
    return null
  }
}

export default injectIntl(CampaignPage);
