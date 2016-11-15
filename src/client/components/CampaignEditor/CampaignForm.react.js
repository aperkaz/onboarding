import { PropTypes } from 'react';
import { Field } from 'redux-form';
import ReduxFormDateRange from '../common/ReduxFormDateRange.react';
import _ from 'lodash';


const renderTextInput = (field) => {
  const { meta: { touched, error } } = field;
  let hasError = !_.isEmpty(error) && touched;
  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right"></div>
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
                          {error}
                      </span>
      </div> : null
      }
    </div>
  );
};

const CampaignForm = ({ mode, formLabel, submitButtonLabel, onCancel, onSave, handleSubmit }) => {
  return (
    <div className="form-horizontal">
      <h1>
        {formLabel}
      </h1>
      <div className="row">
        <div className="col-md-8">
          <Field disabled={mode === 'update'} label='Campaign Id' name="campaignId" component={renderTextInput}/>
          <Field label='Description' name="description" component={renderTextInput}/>
          <ReduxFormDateRange toFieldName="endsOn" fromFieldName="startsOn" label="Starts / Ends On"/>
          <Field label='Status' name="status" component={renderTextInput}/>
          <Field label='Campaign Type' name="campaignType" component={renderTextInput}/>
          <Field label='Owner' name="owner" component={renderTextInput}/>
        </div>
      </div>
      <div className="form-submit text-right">
        <button className="btn btn-link" onClick={onCancel}>
          Cancel
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
  handleSubmit: PropTypes.func.isRequired //this function is injected by redux-form, don't define it by yourself
};

export default CampaignForm;


