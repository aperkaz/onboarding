import _ from 'lodash';
import datepicker from './bootstrap-datepicker';
import './bootstrap-datepicker-i18n';

import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import './date-picker.css';

export default class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.locale = props.locale || 'en';

    let format = props.format || 'dd/MM/yyyy';

    //normalize format from Java to bootstrap-datepicker
    this.format = format.replace(/M{2}/g, 'mm').replace('mmmm', 'MM');

    this.options = props.options || {};
  }

  static propTypes = {
    showIcon: React.PropTypes.bool,
    containerSelector: React.PropTypes.string,
    // Possible options: https://bootstrap-datepicker.readthedocs.io/en/latest/options.html
    // additionally you can receive 'events' [{ name: 'hide', fn: () => {} }, ...]
    // Possible events: https://bootstrap-datepicker.readthedocs.io/en/latest/events.html
    options: React.PropTypes.object
  };

  static defaultProps = {
    showIcon: true,
    containerSelector: 'body',
    options: {
      events: []
    }
  };

  prepareOptions() {
    let defaultOptions = {
      autoclose: true,
      todayHighlight: true,
      todayBtn: 'linked',
      language: this.locale,
      format: this.format,
      forceParse: false,
      showAnim: 'fold',
      showButtonPanel: true,
      clearBtn: true,
      disabled: this.props.disabled,
      container: this.props.containerSelector
    };

    return {
        ...defaultOptions,
        ...this.options
    }
  }

  componentDidMount() {
    let input = ReactDOM.findDOMNode(this.refs.input);
    this.dateElement = input;
    if (this.props.showIcon) {
      this.dateElement = this.refs.group;
    }

    let datePicker = jQuery(this.dateElement)
      .datepicker(this.prepareOptions())
      .on('changeDate', function () {
        // fire event to change date
        var event = document.createEvent('Event');
        event.initEvent('input', true, true);
        input.dispatchEvent(event);
      });
      //options can be an empty object, see the JcDate
      if (this.props.options.events !== undefined) {
        this.props.options.events.map(event => datePicker.on(event.name, event.fn));
      }
  }

  componentWillUnmount() {
    jQuery(this.dateElement).datepicker('remove');
  }

  render() {
    let inputProps = _.omit(this.props, ['showIcon', 'containerSelector', 'options', 'blur', 'locale']);
    let onBlur = () => {this.props.onBlur === 'function' ? this.props.onBlur() : null};
    let element = (<input {...inputProps} onBlur={onBlur} ref="input"/>);
    if (this.props.showIcon && !this.props.disabled) {
      return (
        <div className="input-group date" ref="group" >
          {element}
          <span className="input-group-addon" ref="toggleBtn">
            <span className="glyphicon glyphicon-calendar"></span>
          </span>
        </div>
      );
    } else {
      return element;
    }
  }
}
