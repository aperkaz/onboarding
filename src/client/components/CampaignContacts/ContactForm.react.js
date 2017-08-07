import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { CAMPAIGN_CONTACT_FIELDS } from '../../constants/campaignContacts';
import FormFieldError from '../common/FormFieldError';

class ContactForm extends Component {
  componentWillMount() {
    const serviceRegistry = (service) => ({ url: `${this.props.actionUrl}/isodata` });
    const CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });

    this.externalComponents = { CountryField };
  }

  renderFieldComponent = (field) => {
    const { CountryField } = this.externalComponents;
    const { meta: { touched, error } } = field;
    const hasError = !_.isEmpty(error) && touched;
    const TextComponent = (
      <input
        readOnly={field.readOnly}
        disabled={field.disabled}
        {...field.input}
        className="form-control"
        name={field.name}
        type="text"
      />
    );
    const CountryComponent = (
      <CountryField
        actionUrl={this.props.actionUrl}
        {...field.input}
      />
    );
    const component = field.input.name === "country" ? CountryComponent : TextComponent;

    return (
      <div className={`form-group ${hasError ? 'has-error' : ''}`}>
        <label className="col-sm-4 control-label" htmlFor={field.name}>{field.label}</label>
        <div className="col-sm-8">
          {component}
        </div>
        <FormFieldError
          hasError={hasError}
          error={error}
        />
      </div>
    );
  }

  render() {
    const { mode, submitButtonLabel, closeButtonLabel, onCancel, onSave, handleSubmit, intl } = this.props;
    return (
      <div className="form-horizontal">
        <div className="row">
          <div className="col-md-12">
            <Field
              disabled={mode === 'update'}
              label={intl.formatMessage({ id: 'campaignContactEditor.contactForm.email.label' })}
              name="email"
              component={this.renderFieldComponent}
            />

            {
              _.map(
                _.without(CAMPAIGN_CONTACT_FIELDS, 'email', 'campaignId', (mode == "create" ? "supplierId": "")),
                (contactFieldName) => (
                  <Field
                    key={contactFieldName}
                    label={intl.formatMessage({ id: `campaignContactEditor.contactForm.${contactFieldName}.label` })}
                    name={contactFieldName}
                    component={this.renderFieldComponent}
                    disabled={["status", "supplierId"].includes(contactFieldName)}
                  />
                ))
            }
          </div>
        </div>
        <div className="form-submit text-right">
          <button className="btn btn-link" onClick={onCancel}>
            {closeButtonLabel}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit(onSave)}>
            {submitButtonLabel}
          </button>
        </div>
      </div>
    );
  }
}

ContactForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'update']).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
  closeButtonLabel: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired // this function is injected by redux-form, don't define it by yourself
};

ContactForm.defaultProps = {
  actionUrl: window.location.origin
};

export default injectIntl(ContactForm);
