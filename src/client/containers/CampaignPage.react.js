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

  componentWillMount() {
    const { campaignId, contactId } = this.props.params;

    this.props.handleCampaignPageLoading(campaignId, contactId, this.props.location.query.transition);
  }

  setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    location.assign("/campaigns/ncc_onboard");
  }

  render() {
    if (this.props.data.onboardingCampaignContact !== undefined) {
      let data = {
        campaignId: this.props.params.campaignId,
        contactId: this.props.params.contactId,
        contactCompany: this.props.data.onboardingCampaignContact.contact.companyName,
        companyId: 'ncc',
        companyName: 'NCC Svenska AB',
        contactFirstName: this.props.data.onboardingCampaignContact.contact.contactFirstName,
        contactLastName: this.props.data.onboardingCampaignContact.contact.contactLastName,
        contactEmail: this.props.data.onboardingCampaignContact.contact.email
      }
      let stringObj = JSON.stringify(data);
      this.setCookie('CAMPAIGN_INFO', stringObj, 5)
    }

    return null
  }
}

export default injectIntl(CampaignPage);
