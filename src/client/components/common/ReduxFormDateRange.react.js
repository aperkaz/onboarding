import React, { PropTypes, Component } from 'react';
import { Fields } from 'redux-form';
import DatePicker from '../Datepicker/DatePicker.react';
import DateConverter from 'opuscapita-i18n/lib/converters/DateConverter';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

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

  renderErrors(fields) {
    const { fromFieldName, toFieldName } = this.props;
    let fromHasError = !_.isEmpty(fields[fromFieldName].meta.error) && fields[fromFieldName].meta.touched;
    let toHasError = !_.isEmpty(fields[toFieldName].meta.error) && fields[toFieldName].meta.touched;
    if (fromHasError || toHasError) {
      return (
        <div className="col-sm-offset-4">
          <div className="col-sm-6">
            {fromHasError &&
            <span className="label label-danger">
              <FormattedMessage id={fields[fromFieldName].meta.error}/>
            </span>}
          </div>
          <div className="col-sm-6">
            <div className="col-sm-6">
              {toHasError &&
              <span className="label label-danger">
              <FormattedMessage id={fields[toFieldName].meta.error}/>
            </span>}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  renderDateRange = (fields) => {
    const { label, fromFieldName, toFieldName } = this.props;
    const { locale, formatPatterns } = this.context;
    let fromHasError = !_.isEmpty(fields[fromFieldName].meta.error) && fields[fromFieldName].meta.touched;
    let toHasError = !_.isEmpty(fields[toFieldName].meta.error) && fields[toFieldName].meta.touched;
    return (
      <div className={`form-group ${(fromHasError || toHasError) ? 'has-error' : ''}`}>
        <label className="control-label col-sm-3">
          {label}
        </label>
        <div className="col-sm-1 text-right"/>
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
        {this.renderErrors(fields)}
      </div>
    );
  };

  render() {
    const { locale, formatPatterns } = this.context;
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
    const { fromFieldName, toFieldName } = this.props;

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
