import { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { updateCampaign } from '../actions/campaigns/update';
import { findCampaign } from '../actions/campaigns/find';
import { reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../constants/forms';
import CampaignForm from '../components/CampaignEditor/CampaignForm.react';
import { injectIntl, intlShape } from 'react-intl';
import { validateCampaign } from '../components/common/campaignValidator';
import Navigator from '../components/common/Navigator.react';

import CampaignEditForm from './CampaignEdit.react';
import CampaignCreateForm from './CampaignCreate.react';
import CampaignEmailTemplate from './CampaignEmailTemplate.react';
import CampaignContacts from './CampaignContacts.react';
import CampaignProcess from './CampaignProcess.react';

@connect(
  state => (
    {
      campaignList: state.campaignList,
      campaignContactsData: state.campaignContactList
    }),
  (dispatch) => {
    return {
      handleCreateCampaign: function(router) {
        dispatch(createCampaign(router));
      },
      handleUpdateCampaign: (campaignId) => {
        dispatch(updateCampaign(campaignId))
      },
      handleFindCampaign: (campaignId) => {
        dispatch(findCampaign(campaignId))
      }
    }
  }
)
class Campaign extends Component {
  constructor(props) {
    super(props);

    this.editorNavigation = {
      'Campaign': {
        name: 'Campaign',
        url: '/campaigns<%campaignId%>',
        block: false,
        icon: '1'
      },
      'EmailTemplate': {
        name: 'Email Template',
        url: '/campaigns<%campaignId%>/template/email',
        block: true,
        icon: '2'
      },
      'OnboardTemplate': {
        name: 'Onboard Template',
        url: '/campaigns<%campaignId%>/template/onboard',
        block: true,
        icon: '3'
      },
      'Contacts': {
        name: 'Contacts',
        url: '/campaigns<%campaignId%>/contacts',
        block: true,
        icon: '4'
      },
      'ProcessEmails': {
        name: 'Emails',
        url: '/campaigns<%campaignId%>/process',
        block: true,
        icon: '5'
      }
    };

    this.level = Object.keys(this.editorNavigation);

    this.component = {};
  }

  static propTypes = {
    intl: intlShape.isRequired,
    handleCreateCampaign: PropTypes.func.isRequired,
    handleUpdateCampaign: PropTypes.func.isRequired,
    campaignList: PropTypes.object.isRequired,
    params: PropTypes.object
  };

  static contextTypes = {
    currentUserInfo: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.decideComponent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname != nextProps.location.pathname) {
      this.decideComponent(nextProps);
    }
    this.props = nextProps;
  }

  decideComponent = (props) => {
    const { intl, handleCreateCampaign } = props;
    const { currentUserInfo: { username } } = this.context;

    if (props.params.campaignId && props.route.path.indexOf('template/onboard') > -1) {
      this.component = {
        editor: 'OnboardTemplate',
        block: 'ProcessEmails',
        component: <CampaignEmailTemplate {...props} type="onboarding" campaignId={props.params.campaignId}/>
      };
    } else if (props.params.campaignId && props.route.path.indexOf('template/email') > -1) {
      this.component = {
        editor: 'EmailTemplate',
        block: 'ProcessEmails',
        component: <CampaignEmailTemplate {...props} type="email" campaignId={props.params.campaignId} />
      };
    } else if (props.params.campaignId && props.route.path.indexOf('contacts') > -1) {
      this.component = {
        editor: 'Contacts',
        block: 'ProcessEmails',
        component: <CampaignContacts {...props} />
      };
    } else if (props.params.campaignId && props.route.path.indexOf('process') > -1) {
      if (this.props.campaignContactsData.campaignContacts && this.props.campaignContactsData.campaignContacts.length > 0) {
        this.component = {
          editor: 'ProcessEmails',
          block: '',
          component: <CampaignProcess campaignId={props.params.campaignId} />
        };
      } else {
        this.context.router.push(`/campaigns/edit/${props.params.campaignId}/contacts`);
      }
    } else if (props.params.campaignId) {
      this.component = {
        editor: 'Campaign',
        block: 'ProcessEmails',
        component: <CampaignEditForm {...props} handleBack={this.handleBack}/>
      };
    } else {
      this.component = {
        editor: 'Campaign',
        block: 'EmailTemplate',
        component: <CampaignCreateForm {...props} handleBack={this.handleBack} />
      };
    }
  }

  handleBack = () => {
    this.context.router.push('/campaigns/');
  }

  formatNavigator = () => {
    let modifiedNavigation = {}, index = 0, activeIndex = this.level.indexOf(this.component.block);
    for (let editorNavigation in this.editorNavigation) {
      index++;
      modifiedNavigation[editorNavigation] = {};
      modifiedNavigation[editorNavigation].name = this.editorNavigation[editorNavigation].name;
      modifiedNavigation[editorNavigation].url = this.editorNavigation[editorNavigation].url.replace("<%campaignId%>", this.props.params.campaignId ? "/edit/" + this.props.params.campaignId : "");
      modifiedNavigation[editorNavigation].block = activeIndex < index && activeIndex > -1;
      modifiedNavigation[editorNavigation].icon = this.editorNavigation[editorNavigation].icon;
    }

    return {
      steps: modifiedNavigation,
      active: this.component.editor,
      component: this.component.component
     }
  }

  render() {
    let navigatorProps = this.formatNavigator();

    return (
      <Navigator {...this.props} {...this.context} steps={navigatorProps.steps} active={navigatorProps.active} body={navigatorProps.component} />
    )
  }
}

export default injectIntl(Campaign);
