import React, { PropTypes, Component } from 'react';
import { Fields } from 'redux-form';
import DatePicker  from '../Datepicker/DatePicker.react';
import { DateConverter } from '../../../utils/converters';

export default class ReduxFormDateRange extends Component {

  static propTypes = {
    fromFieldName: PropTypes.string.isRequired,
    toFieldName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  };

  static contextTypes = {
    locale: React.PropTypes.string.isRequired,
    formatPatterns: React.PropTypes.object.isRequired
  };

  renderDateRange = (fields) => {
    const {label, fromFieldName, toFieldName} = this.props;
    const {locale, formatPatterns} = this.context;
    return (
      <div className="form-group">
        <label className="control-label col-sm-3">
          {label}
        </label>
        <div className="col-sm-1 text-right"></div>
        <div className="col-sm-8">
          <div className="input-group" style={{ width: '100%' }}>
            <DatePicker
              {...fields[fromFieldName].input}
              className="form-control"
              showIcon={false}
              name={fromFieldName}
              format={formatPatterns[locale].datePattern}
              locale={locale}
            />
            <span className="input-group-addon">—</span>
            <DatePicker
              {...fields[toFieldName].input}
              className="form-control"
              showIcon={false}
              name={toFieldName}
              format={formatPatterns[locale].datePattern}
              locale={locale}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {locale, formatPatterns} = this.context;
    let dateConverter = new DateConverter(formatPatterns[locale].datePattern, locale);

    const parseDate = (value, name) => {
      try {
        return dateConverter.stringToValue(value);
      } catch (ignore) {
        return null;
      }
    };

    const formatDate = (value, name) => {
      try {
        return dateConverter.valueToString(value);
      } catch (ignore) {
        return null;
      }
    };
    const {fromFieldName, toFieldName} = this.props;

    return (
      <Fields
        parse={parseDate}
        format={formatDate}
        names={[fromFieldName, toFieldName]}
        component={this.renderDateRange}
      />
    );
  }
}
