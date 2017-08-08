import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import ReduxFormDateRange from '../common/ReduxFormDateRange.react';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import FormFieldError from '../common/FormFieldError';
import { getInvitationCode } from '../../actions/campaigns/getInvitationCode';

const serviceRegistry = (service) => ({ url: '/isodata' });

const LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
const CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });

@connect(
  state => ({
    invitationCode: state.invitationCode
  }),
  dispatch => ({
    getInvitationCode: (onChange) => {
      dispatch(getInvitationCode(onChange));
    }
  })
)
class InvitationCodeCheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCode: false
    }

  }
  render () {
    const { meta: { touched, error } } = this.props;
    const { input: { value, onChange } } = this.props;
    let hasError = !_.isEmpty(error) && touched;
    const generateCode = (e) => {
      this.setState({
        showCode: !this.state.showCode
      });
      if (value === '' && !this.state.showCode) {
        this.props.getInvitationCode(onChange);
      }
      this.state.showCode? onChange(false): onChange(this.props.invitationCode);
    }
    return (
      <div className={`form-group ${hasError ? 'has-error' : ''}`}>
        <label className="col-sm-3 control-label" htmlFor={this.props.input.name}>{this.props.label}</label>
        <div className="col-sm-1 text-right" />
        <div className="col-sm-8">
          <input
            type="checkbox"
            onChange={generateCode}
            disabled={this.props.disabled}
            />
            {this.state.showCode ? <span>{this.props.invitationCode}</span> : null}
        </div>
        <FormFieldError hasError={hasError} error={error} />
      </div>
    );
  }
}

const renderTextInput = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right" />
      <div className="col-sm-8">
        <input
          readOnly={field.readOnly}
          disabled={field.disabled}
          {...field.input}
          className="form-control"
          name={field.name}
          type="text"
        />
      </div>
      <FormFieldError
        hasError={hasError}
        error={error}
      />
    </div>
  );
};

const getOptionValues = (options) => (
  options.map((option) => (
    <option
      key={option}
      value={option}
    >
      {option}
    </option>
  ))
);

const renderSelectInput = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right" />
      <div className="col-sm-8">
        <select
          {...field.input}
          name={field.name}
          className="form-control"
        >
          {getOptionValues(field.children[1])}
        </select>
      </div>
      <FormFieldError
        hasError={hasError}
        error={error}
      />
    </div>
  );
};

const renderLanguageField = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right" />
      <div className="col-sm-8">
        <LanguageField
          key={field.name}
          actionUrl={document.location.origin}
          {...field.input}
          name={field.name}
        />
      </div>
      <FormFieldError
        hasError={hasError}
        error={error}
      />
    </div>
  );
}

const renderCountryField = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right" />
      <div className="col-sm-8">
        <CountryField
          key={field.name}
          actionUrl={document.location.origin}
          {...field.input}
          name={field.name}
        />
      </div>
      <FormFieldError
        hasError={hasError}
        error={error}
      />
    </div>
  );
}

const CampaignForm = ({ mode, formLabel, submitButtonLabel, onCancel, onSave, campaigntype, handleSubmit, intl }) => {
  return (
    <div className="form-horizontal">
      <h1>
        {formLabel}
      </h1>
      <div className="row">
        <div className="col-md-8">
          <Field
            disabled={mode === 'update'}
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.campaignId.label' })}
            name="campaignId"
            component={renderTextInput}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.description.label' })}
            name="description"
            component={renderTextInput}
          />
          <ReduxFormDateRange
            toFieldName="endsOn"
            fromFieldName="startsOn"
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.startsEndsOn.label' })}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.status.label' })}
            name="status"
            component={renderTextInput}
            disabled={true}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.campaignType.label' })}
            name="campaignType"
            component={renderSelectInput}
          >
            data_campaigntype = {campaigntype}
          </Field>
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.owner.label' })}
            name="owner"
            component={renderTextInput}
            disabled={true}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.country.label' })}
            name="countryId"
            component={renderCountryField}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.language.label' })}
            name="languageId"
            component={renderLanguageField}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.campaignForm.nonEmailInvitationCode.label' })}
            name="invitationCode"
            component={InvitationCodeCheckBox}
            disabled={mode === 'update'}
            id="invitationCode"
            defaultValue={null}
          />
        </div>
      </div>
      <div className="form-submit text-right">
        <button className="btn btn-link" onClick={onCancel}>
          {intl.formatMessage({ id: 'campaignEditor.campaignForm.button.cancel' })}
        </button>
        <button className="btn btn-primary" onClick={handleSubmit(onSave)}>
          {submitButtonLabel}
        </button>
      </div>
    </div>
  );
};

CampaignForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'update']).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  formLabel: PropTypes.string.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  campaigntype: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired // this function is injected by redux-form, don't define it by yourself
};

export default injectIntl(CampaignForm);
