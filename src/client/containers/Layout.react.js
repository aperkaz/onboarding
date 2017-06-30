import React, { Component, PropTypes } from 'react';
import NotificationSystem from 'react-notification-system';
import { HeaderMenu, SidebarMenu } from 'ocbesbn-react-components';
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
class Layout extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    notification: PropTypes.object.isRequired,
  };

  state = {
    oldOpenMenuName: null,
    currentOpenMenuName: null,
    activeMainMenuName: 'Home',
    activeSubMenuName: null
  };

  componentWillReceiveProps(nextProps) {
    const { notification, intl } = nextProps;
    if (_.size(notification.message) > 0) {
      // to support notification message translation we send i18 keys via redux and change them to
      // real translation before displaying
      this.refs.notificationSystem.addNotification(
        {
          ...notification,
          message: intl.formatMessage({ id: notification.message })
        }
      );
    } else {
      this.removeNotification()
    }
  }

  removeNotification() {
    setTimeout(() => {
      this.refs.notificationSystem.removeNotification(this.props.notification);
    }, 5000);
  }

  render() {
    const { currentUserData } = this.props;

    return (
      <div>
        <SidebarMenu isBuyer={Boolean(currentUserData.customerid)} />
        <section className="content">
          <HeaderMenu currentUserData={currentUserData} />
          <div className="container-fluid" style={{ paddingLeft: '250px' }}>
            <NotificationSystem ref="notificationSystem"/>
            <div>
              {this.props.children}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default injectIntl(Layout);
