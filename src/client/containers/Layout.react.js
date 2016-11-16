import React, { Component, PropTypes } from 'react';
import NotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';
import _ from 'lodash';
import {injectIntl, intlShape} from 'react-intl';

@connect(state => ({ notification: state.notification }))
class Layout extends Component {

  static propTypes = {
    intl: intlShape.isRequired,
    notification: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    const {notification, intl} = nextProps;
    if (_.size(notification.message) > 0) {
      //to support notification message translation we send i18 keys via redux and change them to
      //real translation before displaying
      this.refs.notificationSystem.addNotification(
        {
          ...notification,
          message: intl.formatMessage({id: notification.message})
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
    return (
      <div className="container">
        <NotificationSystem ref="notificationSystem"/>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default injectIntl(Layout);
