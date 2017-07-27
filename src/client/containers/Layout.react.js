import React, { Component, PropTypes } from 'react';
import NotificationSystem from 'react-notification-system';
import { HeaderMenu, SidebarMenu } from 'ocbesbn-react-components';
import ModalDialog from '../components/common/ModalDialog.react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import './Layout.css';

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
        hideModalDialog:  PropTypes.func.isRequired
    };

    state = {
        oldOpenMenuName: null,
        currentOpenMenuName: null,
        activeMainMenuName: 'Home',
        activeSubMenuName: null,
        modalDialog: { visible : false }
    };

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

    hideNotification = (notification) =>
    {
        return this.removeNotification(notification);
    }

    showModalDialog = (title, message, buttons, onConfirm, onCancel) =>
    {
        const modalDialog = {
            visible: true,
            title: title,
            message: message,
            buttons: buttons || ['ok', 'cancel'],
            onConfirm: onConfirm,
            onCancel: onCancel
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
            hideModalDialog: this.hideModalDialog
        };
    }

    componentWillReceiveProps(nextProps)
    {
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
                  onConfirm={this.state.modalDialog.onConfirm}
                  onCancel={this.state.modalDialog.onCancel}
                 />
            </div>
        );
    }
}

export default injectIntl(Layout);
