import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store';
import { browserHistory } from 'react-router';
import routes from '../routes';
import Router from 'react-router/lib/Router';

export default class CampaignsApplication extends Component {

  static propTypes = {
    availableServices: PropTypes.array.isRequired,
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired,
    currentUserInfo: PropTypes.object.isRequired
  };

  static contextTypes = {
    locale: PropTypes.string,
    formatPatterns: PropTypes.object
  };

  static childContextTypes = {
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired,
    currentUserInfo: PropTypes.object.isRequired
  };

  getChildContext() {
    if (!this.context.locale) {
      this.context.locale = this.props.locale
    }

    if (!this.context.formatPatterns) {
      this.context.formatPatterns = this.props.formatPatterns
    }

    if (!this.context.currentUserInfo) {
      this.context.currentUserInfo = this.props.currentUserInfo
    }

    return {
      locale: this.context.locale,
      formatPatterns: this.context.formatPatterns,
      currentUserInfo: this.context.currentUserInfo
    };
  }

  render() {
    return (
      <Provider store={configureStore({ serviceRegistry: this.props.availableServices })}>
        <Router history={browserHistory}>
          {routes('')}
        </Router >
      </Provider>
    );
  }
}
