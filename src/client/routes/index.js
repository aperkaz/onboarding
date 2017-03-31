import React, { PropTypes } from 'react';
import { Route } from 'react-router';
import CampaignDashboard from '../containers/CampaignDashboard.react';
import CampaignSearch from '../containers/CampaignSearch.react';
import Layout from '../containers/Layout.react';
import CampaignPage from '../containers/CampaignPage.react';
import Campaign from '../containers/Campaign.react';
import messages from '../i18n'
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';

class TranslatedComponent extends React.Component {
  static contextTypes = {
    locale: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    addLocaleData([...en, ...de]);
  }

  render() {
    return (
      <IntlProvider locale={this.context.locale} messages={messages[this.context.locale]}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default (pathPrefix) => {
  return (
    <Route component={TranslatedComponent}>
      <Route path={`${pathPrefix}/campaigns/campaignPage/:campaignId/:contactId`} component={CampaignPage}/>
      <Route component={Layout}>
        <Route path={`${pathPrefix}/campaigns/ncc_onboard`}/>
        <Route path={`${pathPrefix}/campaigns`} component={CampaignSearch}/>
        <Route path={`${pathPrefix}/campaigns/create`} component={Campaign}/>
        <Route path={`${pathPrefix}/campaigns/dashboard`} component={CampaignDashboard}/>
        <Route path={`${pathPrefix}/campaigns/campaignPage/:campaignId/:contactId`} component={CampaignPage}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId/contacts`} component={Campaign}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId/process`} component={Campaign}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId/template/onboard`} component={Campaign}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId/template/email`} component={Campaign}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId`} component={Campaign}/>
      </Route>
    </Route>
  );
}
