import React, {PropTypes} from 'react';
import {Route} from 'react-router';
import CampaignDashboard from '../containers/CampaignDashboard.react';
import CampaignSearch from '../containers/CampaignSearch.react';
import Layout from '../containers/Layout.react';
import Campaign from '../containers/Campaign.react';
import messages from '../i18n'
import {IntlProvider, addLocaleData} from 'react-intl';
import I18nManager from 'opuscapita-i18n/lib/utils/I18nManager';
import ajax from 'superagent-bluebird-promise';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';

class TranslatedComponent extends React.Component {

  static contextTypes = {
    locale: PropTypes.string.isRequired
  };

  static childContextTypes = {
    i18n: PropTypes.object.isRequired,
    locale: React.PropTypes.string,
    setLocale: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      i18n: new I18nManager('en', []),
      locale: (window.currentUserData && window.currentUserData.locale) || 'en'
    }

    addLocaleData([
      ...en,
      ...de
    ]);

    ajax.get('/user/users/current/profile')
        .then(res => JSON.parse(res.text))
        .then(profile => this.setLocale(profile.languageId))
        .catch(e => { });
  }

  getChildContext() {
    return {
        i18n: this.state.i18n,
        locale: this.state.locale,
        setLocale: this.setLocale
    };
  }

  setLocale = (locale) => {

    let i18n = new I18nManager(locale, []);

    this.setState({
        i18n: i18n,
        locale: locale
    });

    return ajax.put('/user/users/current/profile')
      .set('Content-Type', 'application/json')
      .send({ languageId: locale })
      .then(data => request.post('/refreshIdToken').set('Content-Type', 'application/json').promise());
  }

  render() {
    return (
      <IntlProvider key={this.state.locale} locale={this.state.locale} messages={messages[this.state.locale]}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default(pathPrefix = '') => {
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
