/* eslint-disable react/prop-types */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';

import { startCampaign } from '../actions/campaigns/start';
import { loadCampaignContacts } from '../actions/campaignContacts/load';

import Thumbnail from '../components/common/Thumbnail.react';
import Template from '../../utils/template';

@connect(
  state => ({
    campaignContactsData: state.campaignContactList,
    campaignList: state.campaignList
  }),
  (dispatch) => ({
    handleStart: (campaignId) => {
      dispatch(startCampaign(campaignId));
    },
    handleLoadCampaignContacts: (campaignId) => {
      dispatch(loadCampaignContacts(campaignId));
    }
  })
)
class CampaignProcess extends Component {
  static propTypes = {
      intl: intlShape.isRequired
  }
  static contextTypes = {
      showNotification: PropTypes.func.isRequired,
      hideNotification:  PropTypes.func.isRequired,
      showModalDialog:  PropTypes.func.isRequired,
      hideModalDialog:  PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.disableButton = true;
  }

  componentWillMount() {
    this.checkContacts();
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
  }

  checkContacts = () => {
    const { campaignContactsData } = this.props;

    if (campaignContactsData && campaignContactsData.campaignContacts) {
      // do check
      this.disableButton = false;
    } else {
      this.props.handleLoadCampaignContacts(this.props.campaignId);
    }
  }

  handleStartProcess = () => {
    this.props.handleStart(this.props.campaignId);
  }

  handleCancelProcess = () => {
    this.context.hideModalDialog();
  }

  handleClickProcess = () => {
    const contacts = this.props.campaignContactsData && this.props.campaignContactsData.campaignContacts;
    const newCampaignContactsLength = _.filter(contacts, contact => contact.status === 'new' && contact.email).length || '0';
    const title = this.props.intl.formatMessage({ id: 'modal.start.header' });
    const message = this.props.intl.formatMessage({ id: 'modal.start.body' })
        + " " + this.props.intl.formatMessage({ id: 'modal.start.info' }, { length : newCampaignContactsLength });
    const buttons = ['yes', 'no'];

    this.context.showModalDialog(title, message, buttons, this.handleStartProcess, this.handleCancelProcess);
  }

  render() {
    const { campaignContactsData, campaignContactsData: { campaignContacts } } = this.props;
    const template = new Template();
    const emailtemplates = template.get('email');
    const onboardtemplates = template.get('onboarding');
    const defaultEmailTemplate = template.getDefaultTemplate('email');
    const defaultOnBoardTemplate = template.getDefaultTemplate('onboarding');

    return (
      <div>
        <div className='row'>
          <h3>Selected Email template</h3>
          <div style={{ width: '400px', height: '310px' }}>
              <iframe style={{ width: '800px', height: '600px', transform: 'scale(0.5)', transformOrigin: '0 0'}} src={ `/onboarding/preview/${this.props.campaignId}/template/email`}></iframe>
          </div>
        </div>
        <div className='row'>
          <h3>Selected OnBoard template</h3>
          <div style={{ width: '400px', height: '310px' }}>
              <iframe style={{ width: '1024px', height: '768px', transform: 'scale(0.39)', transformOrigin: '0 0'}} src={ `/onboarding/preview/${this.props.campaignId}/template/landingpage`}></iframe>
          </div>
        </div>
        <div className='row'>
          <h3>Targeted Emails count</h3>
            <span style={{ fontSize: '20px' }}>{campaignContacts.length}</span>
        </div>
        <div className='row' style={{ textAlign: 'center' }}>
          <button
            style={{ height: '50px', width: '280px', fontSize: '20px' }}
            disabled={!(campaignContactsData && campaignContacts)}
            className='btn btn-primary'
            onClick={this.handleClickProcess}
          >
            Launch Campaign
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(withRouter(CampaignProcess));
