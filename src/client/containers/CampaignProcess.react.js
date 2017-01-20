import React from 'react';
import { connect } from 'react-redux';
import StartModal from '../components/common/StartModal.react';
import { loadCampaignContacts } from '../actions/campaignContacts/load';
import { startCampaign } from '../actions/campaigns/start';
import Thumbnail from '../components/common/Thumbnail.react';
import _ from 'lodash';

// loading from utils
import Template from '../../utils/template';

@connect(
  state => ({
    campaignContactsData: state.campaignContactList,
    campaignList: state.campaignList
  }),
  (dispatch) => {
    return {
      handleStart: function(campaignId) {
        dispatch(startCampaign(campaignId));
      },
      handleLoadCampaignContacts: (campaignId) => {
        dispatch(loadCampaignContacts(campaignId));
      }
    }
  }
)
class CampaignProcess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
    this.disableButton = true;
  }

  componentWillMount() {
    this.checkContacts();
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
  }

  checkContacts = () => {
    if (this.props.campaignContactsData && this.props.campaignContactsData.campaignContacts) {
      // do check
      this.disableButton = false;
    } else {
      this.props.handleLoadCampaignContacts(this.props.campaignId);
    }
  }

  onClickProcess = () => {
    this.setState({open: true});
  }

  onStartProcess = () => {
    this.props.handleStart(this.props.campaignId);
  }

  onCancelProcess = () => {
    this.setState({open: false});
  }

  render() {
    let template = new Template();
    let emailtemplates = template.get('email');
    let onboardtemplates = template.get('onboarding');
    let defaultEmailTemplate = template.getDefaultTemplate('email');
    let defaultOnBoardTemplate = template.getDefaultTemplate('onboarding');

    return (
      <div>
        <StartModal isOpen={this.state.open} contacts={_.map(this.props.campaignContactsData.campaignContacts, 'email')} onHide={this.onCancelProcess} onStart={this.onStartProcess}/>
        <div className='row'>
          <h3>Selected Email template</h3>
          <Thumbnail key='email' src={emailtemplates[defaultEmailTemplate].thumbnail} />
        </div>
        <div className='row'>
          <h3>Selected OnBoard template</h3>
          <Thumbnail key='onboard' src={onboardtemplates[defaultOnBoardTemplate].thumbnail} />
        </div>
        <div className='row'>
          <h3>Targeted Emails count</h3>
            <span style={{fontSize: '20px'}}>{this.props.campaignContactsData.campaignContacts.length}</span>
        </div>
        <div className='row' style={{textAlign: 'center'}}>
          <button style={{height: '50px', width: '280px', fontSize: '20px'}} disabled={!(this.props.campaignContactsData && this.props.campaignContactsData.campaignContacts)} className='btn btn-primary' onClick={this.onClickProcess}>
            Launch Campaign
          </button>
        </div>
      </div>
    );
  }
}

export default CampaignProcess;
