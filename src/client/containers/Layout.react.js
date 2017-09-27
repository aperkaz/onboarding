import React, { Component, PropTypes } from 'react';
import NotificationSystem from 'react-notification-system';
import { HeaderMenu, SidebarMenu } from '@opuscapita/react-menus';
import ModalDialog from '../components/common/ModalDialog.react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import './Layout.css';
import request from 'superagent-bluebird-promise';

@connect(
    state => ({
        notification: state.notification,
        currentUserData: state.currentUserData
    })
)
class Layout extends Component
{
    static propTypes = {
        intl: intlShape.isRequired,
        notification: PropTypes.object.isRequired
    };

    static childContextTypes = {
        showNotification: PropTypes.func.isRequired,
        hideNotification:  PropTypes.func.isRequired,
        showModalDialog:  PropTypes.func.isRequired,
        hideModalDialog:  PropTypes.func.isRequired,
        userData: PropTypes.object,
        getUserData : PropTypes.func.isRequired
    };

    state = {
        oldOpenMenuName: null,
        currentOpenMenuName: null,
        activeMainMenuName: 'Home',
        activeSubMenuName: null,
        modalDialog: { visible : false }
    };

    componentDidMount()
    {
        this.loadUserData();
    }

    loadUserData()
    {
        return request.get('/auth/userdata').then(res => this.setState({ userData : res.body }));
    }

    showNotification = (message, level = 'info', autoDismiss = 4, dismissible = true) =>
    {
        return this.renderNotification({
            type: 'SHOW_NOTIFICATION',
            message,
            level,
            autoDismiss,
            dismissible
        });
    }

    hideNotification = (notification, timeout) =>
    {
        if(timeout)
            setTimeout(() => this.removeNotification(notification), timeout);
        else
            return this.removeNotification(notification);
    }

    showModalDialog = (title, message, buttons, onButtonClick) =>
    {
        const modalDialog = {
            visible: true,
            title: title,
            message: message,
            buttons: buttons || ['ok', 'cancel'],
            onButtonClick: onButtonClick
        }

        this.setState({ modalDialog: modalDialog });
    }

    hideModalDialog = () =>
    {
        this.setState({ modalDialog: { visible : false } });
    }

    getChildContext()
    {
        return {
            showNotification: this.showNotification,
            hideNotification: this.hideNotification,
            showModalDialog: this.showModalDialog,
            hideModalDialog: this.hideModalDialog,
            userData: this.state.userData,
            getUserData : this.getUserData.bind(this)
        };
    }

    getUserData()
    {
        return new Promise((resolve, reject) =>
        {
            if(this.state.userData)
                resolve(this.state.userData);
            else
                this.loadUserData().then(() => resolve(this.state.userData)).catch(reject);
        });
    }

    componentWillReceiveProps(nextProps)
    {
        this.loadUserData();
        this.renderNotification(nextProps.notification); // Just use the old code here...
    }

    renderNotification(notification)
    {
        if(this.refs.notificationSystem && notification && notification.message && notification.message.length > 0)
        {
            const translatedMessage = this.props.intl.formatMessage({ id: notification.message });
            return this.refs.notificationSystem.addNotification({ ...notification, message: translatedMessage });
        }

        return false;
    }

    removeNotification(notification)
    {
        if(this.refs.notificationSystem && notification)
            return this.refs.notificationSystem.removeNotification(notification);

        return false;
    }

    render()
    {
        const { currentUserData } = this.props;

        return(
            <div>
                <SidebarMenu isBuyer={ Boolean(currentUserData.customerid) } />
                <section className="content">
                    <HeaderMenu currentUserData={ currentUserData } />
                    <div className="container-fluid" style={{ paddingLeft: '250px' }}>
                        <NotificationSystem ref="notificationSystem"/>
                        <div>
                            { this.props.children }
                        </div>
                    </div>
                </section>
                <ModalDialog
                  visible={this.state.modalDialog.visible}
                  title={this.state.modalDialog.title}
                  message={this.state.modalDialog.message}
                  buttons={this.state.modalDialog.buttons}
                  onButtonClick={this.state.modalDialog.onButtonClick}
                 />
            </div>
        );
    }
}

export default injectIntl(Layout);
