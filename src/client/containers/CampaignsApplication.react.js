import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store';
import { browserHistory, useRouterHistory } from 'react-router';
import { createHistory } from 'history'
import routes from '../routes';
import Router from 'react-router/lib/Router';

class CampaignsApplication extends Component {
  static propTypes = {
    currentService: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired
  };

  static contextTypes = {
    locale: PropTypes.string,
    formatPatterns: PropTypes.object
  };

  static childContextTypes = {
    locale: PropTypes.string.isRequired,
    formatPatterns: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      locale: this.context.locale || this.props.locale,
      formatPatterns: this.context.formatPatterns || this.props.formatPatterns
    }
  }

  render() {
    const { currentService, currentUserData } = this.props;
    const history = useRouterHistory(createHistory)({ basename: `/${currentService.name}`});

    return (
      <Provider store={configureStore({ currentService, currentUserData })}>
        <Router history={history}>
          {routes()}
        </Router >
      </Provider>
    );
  }
}

export default CampaignsApplication
