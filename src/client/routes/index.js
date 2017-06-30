import React, { PropTypes } from 'react';
import { Route } from 'react-router';
import CampaignDashboard from '../containers/CampaignDashboard.react';
import CampaignSearch from '../containers/CampaignSearch.react';
import Layout from '../containers/Layout.react';
import Campaign from '../containers/Campaign.react';
import messages from '../i18n'
import { IntlProvider, addLocaleData } from 'react-intl';
import I18nManager from 'opuscapita-i18n/lib/utils/I18nManager';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';

class TranslatedComponent extends React.Component {
  static contextTypes = {
    locale: PropTypes.string.isRequired
  };

  static childContextTypes = {
    i18n : PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    addLocaleData([...en, ...de]);
  }

  getChildContext() {
    return { i18n : new I18nManager('en', [ ]) };
  }

  render() {
    return (
      <IntlProvider locale={this.context.locale} messages={messages[this.context.locale]}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default (pathPrefix = '') => {
  return (
    <Route component={TranslatedComponent}>
      <Route component={Layout}>
        <Route path={`${pathPrefix}/`} component={CampaignSearch}/>
        <Route path={`${pathPrefix}/create`} component={Campaign}/>
        <Route path={`${pathPrefix}/dashboard`} component={CampaignDashboard}/>
        <Route path={`${pathPrefix}/edit/:campaignId/contacts`} component={Campaign}/>
        <Route path={`${pathPrefix}/edit/:campaignId/process`} component={Campaign}/>
        <Route path={`${pathPrefix}/edit/:campaignId/template/onboard`} component={Campaign}/>
        <Route path={`${pathPrefix}/edit/:campaignId/template/email`} component={Campaign}/>
        <Route path={`${pathPrefix}/edit/:campaignId`} component={Campaign}/>
      </Route>
    </Route>
  );
}
