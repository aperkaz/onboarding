import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import ReduxFormDateRange from '../common/ReduxFormDateRange.react';
import _ from 'lodash';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

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
      {hasError ? <div className="col-sm-offset-4 col-sm-8">
                      <span className="label label-danger">
                        <FormattedMessage id={error}/>
                      </span>
      </div> : null
      }
    </div>
  );
};

const getOptionValues = (data) => {
  return data.map(function(user) {
    return (<option key={user}
      value={user}
    >{user}</option>);
  })
}

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
          <option />
          {getOptionValues(field.children[1])}
        </select>
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
  handleSubmit: PropTypes.func.isRequired // this function is injected by redux-form, don't define it by yourself
};

export default injectIntl(CampaignForm);
