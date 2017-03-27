/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withRouter } from 'react-router';

import { startCampaign } from '../actions/campaigns/start';
import { loadCampaignContacts } from '../actions/campaignContacts/load';
import StartModal from '../components/common/StartModal.react';
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
  constructor(props) {
    super(props);
    this.state = { open: false };
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

  handleClickProcess = () => {
    this.setState({ open: true });
  }

  handleStartProcess = () => {
    this.props.handleStart(this.props.campaignId);
  }

  handleCancelProcess = () => {
    this.setState({ open: false });
  }

  render() {
    const { open } = this.state;
    const { campaignContactsData, campaignContactsData: { campaignContacts } } = this.props;
    const template = new Template();
    const emailtemplates = template.get('email');
    const onboardtemplates = template.get('onboarding');
    const defaultEmailTemplate = template.getDefaultTemplate('email');
    const defaultOnBoardTemplate = template.getDefaultTemplate('onboarding');
    const newCampaignContactsLength = _.filter(campaignContacts, { status: 'new' }).length;
    const oldCampaignContactsLength = _.filter(campaignContacts, (contact) => contact.status !== 'new').length;

    return (
      <div>
        {open && (
          <StartModal
            isOpen={open}
            contacts={campaignContacts}
            onHide={this.handleCancelProcess}
            onStart={this.handleStartProcess}
          />
        )}
        <div className='row'>
          <h3>Selected Email template</h3>
          <Thumbnail
            key='email'
            size={emailtemplates[defaultEmailTemplate].size}
            src={this.props.router.createPath(emailtemplates[defaultEmailTemplate].thumbnail)}
          />
        </div>
        <div className='row'>
          <h3>Selected OnBoard template</h3>
          <Thumbnail
            key='onboard'
            size={onboardtemplates[defaultOnBoardTemplate].size}
            src={this.props.router.createPath(onboardtemplates[defaultOnBoardTemplate].thumbnail)}
          />
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

export default withRouter(CampaignProcess);
