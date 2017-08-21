import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaigns/create';
import { updateCampaign } from '../actions/campaigns/update';
import { findCampaign } from '../actions/campaigns/find';
import { injectIntl, intlShape } from 'react-intl';
import Navigator from '../components/common/Navigator.react';

import CampaignEditForm from './CampaignEdit.react';
import CampaignCreateForm from './CampaignCreate.react';
import CampaignEmailTemplate from './CampaignEmailTemplate.react';
import CampaignContacts from './CampaignContacts.react';
import CampaignProcess from './CampaignProcess.react';

@connect(
  state => ({
    campaignList: state.campaignList,
    campaignContactsData: state.campaignContactList
  }),
  (dispatch) => ({
    handleCreateCampaign: (router) => {
      dispatch(createCampaign(router))
    },
    handleUpdateCampaign: (campaignId) => {
      dispatch(updateCampaign(campaignId))
    },
    handleFindCampaign: (campaignId) => {
      dispatch(findCampaign(campaignId))
    }
  })
)
class Campaign extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleCreateCampaign: PropTypes.func.isRequired,
    handleUpdateCampaign: PropTypes.func.isRequired,
    campaignList: PropTypes.object.isRequired,
    campaignContactsData: PropTypes.object,
    params: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.editorNavigation = {
      'Campaign': {
        name: 'Campaign',
        url: '<%campaignId%>',
        block: false,
        icon: '1'
      },
      'Contacts': {
        name: 'Contacts',
        url: '<%campaignId%>/contacts',
        block: true,
        icon: '2'
      },
      'EmailTemplate': {
        name: 'Email Template',
        url: '<%campaignId%>/template/email',
        block: true,
        icon: '3'
      },
      'OnboardTemplate': {
        name: 'Onboard Template',
        url: '<%campaignId%>/template/onboard',
        block: true,
        icon: '4'
      },
      'ProcessEmails': {
        name: 'Emails',
        url: '<%campaignId%>/process',
        block: true,
        icon: '5'
      }
    };

    this.level = Object.keys(this.editorNavigation);
    this.component = {};
  }

  componentWillMount() {
    this.decideComponent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.decideComponent(nextProps);
    }
    this.props = nextProps;
  }

  decideComponent = (props) => {
    if (props.params.campaignId && props.route.path.indexOf('template/onboard') > -1) {
      this.component = {
        editor: 'OnboardTemplate',
        block: 'OnboardTemplate',
        component: <CampaignEmailTemplate {...props} type="onboarding" campaignId={props.params.campaignId}/>
      };
    } else if (props.params.campaignId && props.route.path.indexOf('template/email') > -1) {
      this.component = {
        editor: 'EmailTemplate',
        block: 'EmailTemplate',
        component: <CampaignEmailTemplate {...props} type="email" campaignId={props.params.campaignId} />
      };
    } else if (props.params.campaignId && props.route.path.indexOf('contacts') > -1) {
      this.component = {
        editor: 'Contacts',
        block: 'Contacts',
        component: <CampaignContacts {...props} />
      };
    } else if (props.params.campaignId && props.route.path.indexOf('process') > -1) {
      const { campaignContacts } = this.props.campaignContactsData;
        this.component = {
          editor: 'ProcessEmails',
          block: '',
          component: <CampaignProcess campaignId={props.params.campaignId} />
        };
    } else if (props.params.campaignId) {
      this.component = {
        editor: 'Campaign',
        block: 'Campaign',
        component: <CampaignEditForm {...props} onBack={this.handleBack}/>
      };
    } else {
      this.component = {
        editor: 'Campaign',
        block: 'Campaign',
        component: <CampaignCreateForm {...props} onBack={this.handleBack} />
      };
    }
  }

  handleBack = () => {
    this.context.router.push('/');
  }

  formatNavigator = () => {
    let modifiedNavigation = {}, index = 0, activeIndex = this.level.indexOf(this.component.block);
    for (let editorNavigation in this.editorNavigation) {
      index++;
      modifiedNavigation[editorNavigation] = {};
      modifiedNavigation[editorNavigation].name = this.editorNavigation[editorNavigation].name;
      modifiedNavigation[editorNavigation].url = this.editorNavigation[editorNavigation].url.replace(
        "<%campaignId%>",
        this.props.params.campaignId ? "/edit/" + this.props.params.campaignId : ""
      );
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
      <Navigator
        {...this.props}
        {...this.context}
        steps={navigatorProps.steps}
        active={navigatorProps.active}
        body={navigatorProps.component}
      />
    )
  }
}

export default injectIntl(Campaign);
