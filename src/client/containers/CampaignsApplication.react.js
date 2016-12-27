import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store';
import browserHistory from 'react-router/lib/browserHistory';
import routes from '../routes';
import Router from 'react-router/lib/Router';
import { CAMPAIGN_SERVICE_NAME } from '../constants/services';

export default class CampaignsApplication extends Component {

  static propTypes = {
    campaignServiceUrl: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
  };

  static contextTypes = {
    locale: PropTypes.string,
    formatPatterns: PropTypes.object
  };

  static childContextTypes = {
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
  };

  getChildContext() {
    if (!this.context.locale) {
      this.context.locale = this.props.locale
    }

    if (!this.context.formatPatterns) {
      this.context.formatPatterns = this.props.formatPatterns
    }

    if (!this.context.currentUser) {
      this.context.currentUser = this.props.currentUser
    }

    return {
      locale: this.context.locale,
      formatPatterns: this.context.formatPatterns,
      currentUser: this.context.currentUser
    };
  }

  configureServiceRegistry() {
    return (serviceName) => {
      return {
        url: {
          [CAMPAIGN_SERVICE_NAME]: this.props.campaignServiceUrl,
        }[serviceName]
      }
    }
  }

  prepareInitialState() {
    return {
      serviceRegistry: this.configureServiceRegistry()
    }
  }

  render() {
    return (
      <Provider store={configureStore(this.prepareInitialState())}>
        <Router history={browserHistory}>
          {routes}
        </Router >
      </Provider>
    );
  }
}
