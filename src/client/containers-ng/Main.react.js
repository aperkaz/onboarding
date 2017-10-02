import React, { Component } from 'react';
import { Router, Route } from 'react-router';
import PropTypes from 'prop-types';
import { browserHistory, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { HeaderMenu, SidebarMenu } from '@opuscapita/react-menus';
import { ModalDialog } from '../components-ng/common';
import NotificationSystem from 'react-notification-system';
import { I18nManager } from '@opuscapita/i18n';
import Campaign from './Campaign.react';
import TemplateManager from './TemplateManager.react';
import { ResetTimer } from '../system';
import translations from './i18n';
import defaultTranslations from './i18n/default';
import systemTranslations from './i18n/system';
import formatters from './i18n/formatters';

import ajax from 'superagent-bluebird-promise';
import './style/Main.css';
import CampaignSearch from '../containers/CampaignSearch.react';
import CampaignDashboard from '../containers/CampaignDashboard.react';

class Main extends Component
{
    static childContextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object,
        getUserData: PropTypes.func.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired
    };

    constructor(props)
    {
        super(props);

        this.state = {
            userData : null,
            i18n : this.getI18nManager('en'),
            locale : 'en'
        }

        this.notificationSystem = null;
        this.modalDialog = null;
        this.sidebar = null;
        this.headerbar = null;
        this.router = { push : () => null };
        this.progressValue = 0;
        this.ajaxSpinnerTimer = new ResetTimer();
        this.history = useRouterHistory(createHistory)({ basename : '/onboarding' });

        this.watchAjax();
    }

    componentDidMount()
    {
        return this.getUserData().then(userData =>
        {
            this.setState({
                userData,
                i18n : this.getI18nManager(userData.languageid)
            });
        });
    }

    getI18nManager(locale)
    {
        const manager = new I18nManager({ locale, fallbackLocale : 'en', localeFormattingInfo : formatters });
        manager.register('Main', translations);
        manager.register('Default', defaultTranslations);
        manager.register('System', systemTranslations);

        return manager;
    }

    getChildContext()
    {
        return {
            router : this.router,
            showNotification : this.showNotification.bind(this),
            hideNotification : this.hideNotification.bind(this),
            showModalDialog: this.showModalDialog.bind(this),
            hideModalDialog: this.hideModalDialog.bind(this),
            userData : this.state.userData,
            getUserData: this.getUserData.bind(this),
            i18n : this.state.i18n,
            locale : this.state.locale
        }
    }

    showNotification(message, level = 'info', duration = 4)
    {
        return this.notificationSystem.addNotification({ message, level, autoDismiss : duration, position : 'tr' });
    }

    hideNotification(handle)
    {
        this.notificationSystem.removeNotification(handle);
    }

    showModalDialog(title, message, buttons, onButtonClick)
    {
        this.modalDialog.show(title, message, onButtonClick, buttons);
    }

    hideModalDialog()
    {
        this.modalDialog.hide();
    }

    getUserData()
    {
        return new Promise((resolve, reject) =>
        {
            if(this.userData)
                resolve(this.userData);
            else
                ajax.get('/auth/userdata').then(data => resolve(this.userData = data.body)).catch(reject);
        });
    }

    setLocale(locale)
    {
        this.setState({
            locale,
            i18n : this.getI18nManager(locale)
        });
    }

    watchAjax()
    {
        const main = this;
        const oldOpen = XMLHttpRequest.prototype.open;
        const openRequests = { };

        setInterval(() =>
        {
            let overallTotal = 0;
            let overallLoaded = 0;

            for(let id in openRequests)
            {
                overallTotal += openRequests[id].total;
                overallLoaded += openRequests[id].loaded;
            }

            if(overallTotal === 0)
                this.setSystemProgressValue(0);
            else
                this.setSystemProgressValue(overallLoaded / overallTotal);

        }, 500);

        XMLHttpRequest.prototype.open = function()
        {
            main.showSystemSpinner();
            main.ajaxSpinnerTimer.reset(1000, () => main.hideSystemSpinner());

            const requestId = Math.random().toString(36).substr(2, 10);
            openRequests[requestId] = { loaded : 0, total : 0 };

            this.addEventListener('progress', e =>
            {
                if(e.lengthComputable)
                {
                    openRequests[requestId].total = e.total;
                    openRequests[requestId].loaded = e.loaded;
                }
            });

            this.addEventListener('readystatechange', e =>
            {
                const target = e.currentTarget;

                if(target.readyState === 4 && target.status >= 400)
                {
                    const err = new Error(target.response);
                    err.target = target;

                    if(target.getResponseHeader('content-type').indexOf('application/json') !== -1)
                        err.json = JSON.parse(target.response);

                    main.showSystemError(err.message);
                }
                else if(target.readyState === 4)
                {
                    setTimeout(() => delete openRequests[requestId], 1000);
                }
            });

            return oldOpen.apply(this, arguments);
        };
    }

    showSystemError(message)
    {
        const errorEl = $('#system-error-message');

        if(!errorEl.is(':visible'))
        {
            errorEl.find('.system-error-text').text(message);
            errorEl.slideDown(500);
        }
    }

    hideSystemError()
    {
        const errorEl = $('#system-error-message');

        if(errorEl.is(':visible'))
            errorEl.slideUp(500);
    }

    setSystemProgressValue(value)
    {
        this.progressValue = value <= 0 ? 0 : (value > 1 ? 1 : value);
        const progressBar = $('#system-progress-bar .progress-bar');

        if(this.progressValue === 0)
            progressBar.css({ transition : 'none' });
        else
            progressBar.css({ transition : 'width 0.6s ease 0s' })

        progressBar.css({ width : (this.progressValue * 100) + '%' });
    }

    incrementSystemProgressValue(value)
    {
        this.setSystemProgressValue(this.progressValue + value);
    }

    showSystemSpinner()
    {
        $('#system-spinner').fadeIn();
    }

    hideSystemSpinner()
    {
        $('#system-spinner').fadeOut();
    }

    render()
    {
        const campaignComponent = <Campaign />
        const { i18n, userData } = this.state;

        const applicationIsReady = i18n && userData && true;

        if(applicationIsReady)
            setTimeout(() => { this.hideSystemSpinner(); }, 1000);

        return(
            <div>
                {
                    applicationIsReady &&
                    <div id="main">
                        <div id="system-error-message" className="alert alert-danger text-center alert-dismissable">
                            <a href="#" className="close" data-dismiss="alert" aria-label="close" onClick={e => { e.preventDefault(); this.hideSystemError(); }}>×</a>
                            <strong>{i18n.getMessage('Main.systemError.title')}</strong> <span className="system-error-text"></span>
                        </div>

                        <SidebarMenu ref={node => this.sidebar = node} isBuyer={true} />

                        <section className="content">
                            <HeaderMenu ref={node => this.headerbar = node} currentUserData={ userData } />
                            <div id="system-progress-bar" className="progress">
                                <div className="progress-bar progress-bar-warning" role="progressbar"></div>
                            </div>
                            <div className="container-fluid">
                                <NotificationSystem ref={node => this.notificationSystem = node}/>
                                <Router ref={node => this.router = node} history={this.history}>
                                    <Route path={`/`} />
                                    <Route path={`/create`} component={() => campaignComponent}/>

                                    <Route path={`/edit/:campaignId/contacts`} component={() => campaignComponent}/>
                                    <Route path={`/edit/:campaignId/process`} component={() => campaignComponent}/>
                                    <Route path={`/edit/:campaignId/template/onboard`} component={() => campaignComponent}/>
                                    <Route path={`/edit/:campaignId/template/email`} component={() => campaignComponent}/>
                                    <Route path={`/edit/:campaignId`} component={() => campaignComponent}/>
                                    <Route path={`/templates`} component={TemplateManager}/>
                                </Router>
                            </div>
                        </section>

                        <ModalDialog ref={node => this.modalDialog = node} />
                    </div>
                }
                <div id="system-spinner" className="text-center">
                    <div className="inner text-center">
                        <i className="fa fa-cog fa-spin fa-3x fa-fw" />
                    </div>
                </div>
            </div>
        )
    }
}

export default Main;
