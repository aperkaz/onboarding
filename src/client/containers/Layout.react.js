import React, { Component } from 'react';
import NotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';
import _ from 'lodash';

@connect(state => ({ notification: state.notification }))
export default class Layout extends Component {

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    if (_.size(this.props.notification.message) > 0) {
      this.refs.notificationSystem.addNotification(this.props.notification);
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
