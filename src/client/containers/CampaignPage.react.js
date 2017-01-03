import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { onBoardingContact } from '../actions/campaigns/onboard';
import { injectIntl, intlShape } from 'react-intl';

@connect(
  state => ({}),
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
    handleCampaignPageLoading: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.handleCampaignPageLoading(this.props.params.campaignId, this.props.params.contactId, this.props.location.query.transition);
  }

  render() {
    return (
      <div className="container">Campaign {this.props.params.campaignId}
       Hello Here you are on OnBoardingPage.Contact Detail{this.props.params.contactId}
      </div>
    );
  }
}

export default injectIntl(CampaignPage);