import React, { Component } from 'react';
import { Router, Route } from 'react-router';
import PropTypes from 'prop-types';
import { browserHistory, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { HeaderMenu, SidebarMenu } from '@opuscapita/react-menus';
import { ModalDialog } from '../components-ng/common';
import NotificationSystem from 'react-notification-system';
import { I18nManager } from '@opuscapita/i18n';
import InnerLayout from './InnerLayout.react';
import Campaign from './Campaign.react';
import CampaignSearch from './CampaignSearch.react';
import TemplateManager from './TemplateManager.react';
import CampaignDashboard from './CampaignDashboard.react';
import { Auth, Users } from '../api';
import { ResetTimer } from '../system';
import { AjaxExtender } from '../system/ui';
import translations from './i18n';
import defaultTranslations from './i18n/default';
import systemTranslations from './i18n/system';
import formatters from './i18n/formatters';
import ajax from 'superagent-bluebird-promise';
import './proxy.js';
import './style/Main.css';

class Main extends Component
{
    static childContextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired,
        setLocale : PropTypes.func.isRequired
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
        this.mainMenu = null;
        this.modalDialog = null;
        this.sidebar = null;
        this.headerbar = null;
        this.router = null;
        this.progressValue = 0;
        this.ajaxExtender = null;
        this.registeredTranslations = { };
        this.history = useRouterHistory(createHistory)({ basename : '/onboarding' });
        this.authApi = new Auth();
        this.usersApi = new Users();

        this.watchAjax();
    }

    componentWillMount()
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
        const oldRegister = manager.register.bind(manager);

        manager.register('Main', translations);
        manager.register('Default', defaultTranslations);
        manager.register('System', systemTranslations);

        for(const key in this.registeredTranslations)
            manager.register(key, this.registeredTranslations[key]);

        manager.register = (...args) =>
        {
            this.registeredTranslations[args[0]] = args[1];
            return oldRegister(...args);
        }

        return manager;
    }

    getChildContext()
    {
        return {
            router : this.router || { },
            showNotification : this.showNotification.bind(this),
            hideNotification : this.hideNotification.bind(this),
            showModalDialog: this.showModalDialog.bind(this),
            hideModalDialog: this.hideModalDialog.bind(this),
            userData : this.state.userData || { },
            i18n : this.state.i18n,
            locale : this.state.locale,
            setLocale : this.setLocale.bind(this)
        }
    }

    setLocale(locale)
    {
        const id = this.state.userData.id;

        return this.usersApi.updateUserProfile(id, { languageId : locale })
            .then(() => this.authApi.refreshIdToken())
            .then(() => this.getUserData())
            .then(userData => this.setState({ userData, locale, i18n : this.getI18nManager(locale) }));
    }

    showNotification(message, level = 'info', duration = 4)
    {
        if(this.notificationSystem)
            return this.notificationSystem.addNotification({ message, level, autoDismiss : duration, position : 'tr' });
    }

    hideNotification(handle)
    {
        if(this.notificationSystem)
            this.notificationSystem.removeNotification(handle);
    }

    showModalDialog(title, message, onButtonClick, buttons)
    {
        if(this.modalDialog)
            this.modalDialog.show(title, message, onButtonClick, buttons);
    }

    hideModalDialog()
    {
        if(this.modalDialog)
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

    watchAjax()
    {
        const spinnerTimer = new ResetTimer();
        const onRequestStart = (requestId) => null;
        const onProgress = (progress) =>
        {
            this.setSystemProgressValue(progress);
            spinnerTimer.reset(() => this.setSystemProgressValue(0), 2000);
        }

        const onRequestEnd = (err, requestId) => err && this.showSystemError(err.message);

        this.ajaxExtender = new AjaxExtender({ onRequestStart, onProgress, onRequestEnd });
        this.ajaxExtender.run();
    }

    showSystemError(message)
    {
        const errorEl = $('#system-error-message');
        errorEl.find('.system-error-text').text(message);

        if(!errorEl.is(':visible'))
            errorEl.slideDown(500);
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
            progressBar.css({ transition : 'width 1s ease 0s' })

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
            <div id="react-root">
                {
                    applicationIsReady &&
                    <div id="main">
                        <div id="system-error-message" className="alert alert-warning text-center alert-dismissable">
                            <a href="#" className="close" data-dismiss="alert" aria-label="close" onClick={e => { e.preventDefault(); this.hideSystemError(); }}>×</a>
                            <strong>{i18n.getMessage('Main.systemError.title')}</strong>: <span className="system-error-text"></span>
                        </div>

                        <div id="system-progress-bar" className="progress">
                            <div className="progress-bar oc-progress-bar" role="progressbar"></div>
                        </div>
                        <section className="content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-xs-12 col-sm-offset-1 col-sm-10">
                                        <Router ref={node => this.router = node} history={this.history}>
                                            <Route component={InnerLayout}>
                                                <Route path={`/`} component={CampaignSearch} />
                                                <Route path={`/create`} component={() => campaignComponent}/>
                                                <Route path={'/dashboard'} component={CampaignDashboard} />
                                                <Route path={`/edit/:campaignId/contacts`} component={() => campaignComponent}/>
                                                <Route path={`/edit/:campaignId/process`} component={() => campaignComponent}/>
                                                <Route path={`/edit/:campaignId/template/onboard`} component={() => campaignComponent}/>
                                                <Route path={`/edit/:campaignId/template/email`} component={() => campaignComponent}/>
                                                <Route path={`/edit/:campaignId`} component={() => campaignComponent}/>
                                                <Route path={`/templates`} component={TemplateManager}/>
                                            </Route>
                                        </Router>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <NotificationSystem ref={node => this.notificationSystem = node} />
                        <ModalDialog ref={node => this.modalDialog = node} />
                    </div>
                }
                <div id="system-spinner" className="text-center">
                    <div className="inner text-center">
                        <i className="fa fa-cog fa-spin fa-3x fa-fw" />
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;
