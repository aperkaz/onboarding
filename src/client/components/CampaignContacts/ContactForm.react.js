import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import _ from 'lodash';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { CAMPAIGN_CONTACT_FIELDS } from '../../constants/campaignContacts';

const renderTextInput = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-4 control-label" htmlFor={field.name}>{field.label}</label>
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
      {hasError ? <div className="col-sm-offset-4 col-sm-8">
                      <span className="label label-danger">
                        <FormattedMessage id={error}/>
                      </span>
      </div> : null
      }
    </div>
  );
};


const ContactForm = ({
  mode,
  formLabel,
  submitButtonLabel,
  closeButtonLabel,
  onCancel,
  onSave,
  handleSubmit,
  intl
}) => {
  return (
    <div className="form-horizontal">
      <h1>
        {formLabel}
      </h1>
      <div className="row">
        <div className="col-md-12">
          <Field
            disabled={mode === 'update'}
            label={intl.formatMessage({ id: 'campaignContactEditor.contactForm.email.label' })}
            name="email"
            component={renderTextInput}
          />

          {
            _.map(
              _.without(CAMPAIGN_CONTACT_FIELDS, 'email', 'campaignId'),
              (contactFieldName) => {
                return (
                  <Field
                    key={contactFieldName}
                    label={intl.formatMessage({ id: `campaignContactEditor.contactForm.${contactFieldName}.label` })}
                    name={contactFieldName}
                    component={renderTextInput}
                    disabled={contactFieldName === "status" ? true : false}
                  />
                );
              })
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
};

ContactForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'update']).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  formLabel: PropTypes.string.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
  closeButtonLabel: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired // this function is injected by redux-form, don't define it by yourself
};

export default injectIntl(ContactForm);
