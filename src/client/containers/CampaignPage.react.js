import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { OnLoadCampaignPage, Onboarding } from '../actions/campaigns/onboard';
import OnboardingCampaign from '../components/OnboardingCampaign.react';
import { ONBOARDING_CAMPAIGN_FORM } from '../constants/forms';
import { injectIntl, intlShape } from 'react-intl';

@connect(
  state => ({}),
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
  
  setCookie(cname,cvalue) {
    document.cookie = cname + "=" + cvalue;
  }
  componentDidMount() {
    this.props.handleCampaignPageLoading(this.props.params.campaignId, this.props.params.contactId, this.props.location.query.transition);
    var data = {
      campaign_owner_company: 'campaign_owner_company',
      campaignId: this.props.params.campaignId,
      campaignContactId: this.props.params.contactId
    };
    var stringObj = JSON.stringify(data); 
    this.setCookie('CAMPAIGN_INFO', stringObj);
  }

  render() {
    const { intl, Onboarding } = this.props;
    return createElement(reduxForm({
      form: ONBOARDING_CAMPAIGN_FORM,
      fields: ['campaignId', 'contactId', 'transition'],
      initialValues: {
        transition: 'onboarded',
        campaignId: this.props.params.campaignId,
        contactId: this.props.params.contactId
      },
      onSave: Onboarding

    })(OnboardingCampaign));
  }
}

export default injectIntl(CampaignPage);