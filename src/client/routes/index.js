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
import _ from 'lodash';

class TranslatedComponent extends React.Component {
  static contextTypes = {
    i18n: PropTypes.object,
    locale: PropTypes.string
  };

  static childContextTypes = {
    locale: PropTypes.string.isRequired
  };

  getChildContext() {
    if(!this.context.locale){
      return {
        locale: this.getLocale()
      }
    }
  }

  getLocale() {
    if(this.context.locale) {
      return this.context.locale;
    } else if(!_.isUndefined(this.context.i18n)) {
      return this.context.i18n.locale
    } else {
      return 'en'
    }
  }

  constructor(props) {
    super(props);
    addLocaleData([...en, ...de]);
  }

  render() {
    return (
      <IntlProvider locale={this.getLocale()} messages={messages[this.getLocale()]}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default (
  <Route component={TranslatedComponent}>
    <Route component={Layout}>
      <Route path="/campaigns" component={CampaignSearch}/>
      <Route path="/campaigns/create" component={CampaignCreate}/>
      <Route path="/campaigns/edit/:campaignId" component={CampaignEdit}/>

      <Route path="/campaigns/edit/:campaignId/contacts" component={CampaignContacts}/>
    </Route>
  </Route>
);
