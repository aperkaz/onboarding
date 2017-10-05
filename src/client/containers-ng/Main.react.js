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
        manager.register('Main', translations);
        manager.register('Default', defaultTranslations);
        manager.register('System', systemTranslations);

        for(const key in this.registeredTranslations)
            manager.register(key, this.registeredTranslations[key]);

        return manager;
    }

    getChildContext()
    {
        const routerProxy = { get : (target, key) => this.router && this.router.router[key].bind(this.router) };
        const userDataProxy = { get : (target, key) => this.state.userData && this.state.userData[key] };
        const i18nProxy = { get : (target, key) =>
        {
            if(key === 'register')
            {
                return (...args) =>
                {
                    this.registeredTranslations[args[0]] = args[1];
                    return this.state.i18n.register(...args);
                }
            }

            if(this.state.i18n)
            {
                if(typeof this.state.i18n[key] === 'function')
                    return this.state.i18n[key].bind(this.state.i18n);
                else
                    return this.state.i18n[key];
            }
        }}

        return {
            router : new Proxy({ }, routerProxy),
            showNotification : this.showNotification.bind(this),
            hideNotification : this.hideNotification.bind(this),
            showModalDialog: this.showModalDialog.bind(this),
            hideModalDialog: this.hideModalDialog.bind(this),
            userData : new Proxy({ }, userDataProxy),
            i18n : new Proxy({ }, i18nProxy),
            locale : this.state.locale,
            setLocale : this.setLocale.bind(this)
        }
    }

    setLocale(locale)
    {
        const id = this.state.userData.id;

        return this.usersApi.updateUserProfile(id, { languageId : locale })
            .then(() => this.authApi.refreshIdToken())
            .then(() => this.setState({ locale, i18n : this.getI18nManager(locale) }));
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
        const onRequestStart = (requestId) => this.showSystemSpinner();
        const onProgress = (progress) =>
        {
            this.setSystemProgressValue(progress);

            spinnerTimer.reset(() =>
            {
                this.hideSystemSpinner();
                this.setSystemProgressValue(0);

            }, 500);
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
                        <div id="system-error-message" className="alert alert-warning text-center alert-dismissable">
                            <a href="#" className="close" data-dismiss="alert" aria-label="close" onClick={e => { e.preventDefault(); this.hideSystemError(); }}>×</a>
                            <strong>{i18n.getMessage('Main.systemError.title')}</strong>: <span className="system-error-text"></span>
                        </div>

                        <NotificationSystem ref={node => this.notificationSystem = node}/>
                        <SidebarMenu ref={node => this.sidebar = node} isBuyer={true} />

                        <section className="content">
                            <HeaderMenu ref={node => this.headerbar = node} currentUserData={ userData } />
                            <div id="system-progress-bar" className="progress">
                                <div className="progress-bar progress-bar-warning" role="progressbar"></div>
                            </div>
                            <div className="container-fluid">
                                <Router ref={node => this.router = node} history={this.history}>
                                    <Route path={`/`} component={CampaignSearch} />
                                    <Route path={`/create`} component={() => campaignComponent}/>
                                    <Route path={'/dashboard'} component={CampaignDashboard} />
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
