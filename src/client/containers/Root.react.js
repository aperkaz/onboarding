import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store';
import { ReduxRouter } from 'redux-router'
import routes from '../routes';
import { CAMPAIGN_SERVICE_NAME } from '../constants/services';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import messages from '../i18n/en.json'
import de from 'react-intl/locale-data/de';

export default class Root extends Component {
    constructor(props) {
        super(props);
        addLocaleData([...en, ...de]);
    }

    static propTypes = {
        campaignServiceUrl: PropTypes.string.isRequired
    };

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
            <IntlProvider locale="en" messages={messages}>
                <Provider store={configureStore(this.prepareInitialState())}>
                    <ReduxRouter>
                        {routes}
                    </ReduxRouter>
                </Provider>
            </IntlProvider>
        );
    }
}
