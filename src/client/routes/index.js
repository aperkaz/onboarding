import React, { PropTypes } from 'react';
import { Route } from 'react-router';
import CampaignSearch from '../containers/CampaignSearch.react';
import CampaignCreate from '../containers/CampaignCreate.react';
import CampaignEdit from '../containers/CampaignEdit.react';
import CampaignContacts from '../containers/CampaignContacts.react';
import Layout from '../containers/Layout.react';
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
      <Route component={Layout}>
        <Route path={`${pathPrefix}/campaigns`} component={CampaignSearch}/>
        <Route path={`${pathPrefix}/campaigns/create`} component={CampaignCreate}/>
        <Route path={`${pathPrefix}/campaigns/edit/:campaignId`} component={CampaignEdit}/>

        <Route path={`${pathPrefix}/campaigns/edit/:campaignId/contacts`} component={CampaignContacts}/>
      </Route>
    </Route>
  );
}
