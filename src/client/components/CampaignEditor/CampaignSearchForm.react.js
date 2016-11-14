import React, { Component, PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { SEARCH_CAMPAIGN_FORM } from '../../constants/forms';
import ReduxFormDateRange from './ReduxFormDateRange.react';

const renderTextInput = (field) => {
  return (
    <div className="form-group">
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right"></div>
      <div className="col-sm-8">
        <input {...field.input} className="form-control" name={field.name} type="text"/>
      </div>
    </div>
  );
};

const CampaignSearchForm = ({onSearch, onCreate, reset}) => {

  const renderActionToolbar = () => {
    return(
      <div className="form-submit text-right">
        <div className="form-inline">
          <button className="btn btn-link" type="button"
                  onClick={() => reset(SEARCH_CAMPAIGN_FORM)}>
            Reset
          </button>
          <button className="btn btn-default" type="button" onClick={onCreate}>
            Create
          </button>
          <button className="btn btn-primary" type="button" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
    );
  };

  return(
    <div className="form-horizontal">
      <h1>
        Search Campaigns
      </h1>
      <div className="row">
        <div className="col-md-8">
          <Field label='Campaign Id' name="campaignId" component={renderTextInput}/>
          <ReduxFormDateRange toFieldName="endsOn" fromFieldName="startsOn" label="Starts / Ends On"/>
          <Field label='Status' name="status" component={renderTextInput}/>
          <Field label='Campaign Type' name="campaignType" component={renderTextInput}/>
          <Field label='Owner' name="owner" component={renderTextInput}/>
        </div>
      </div>
      {renderActionToolbar()}
      <hr/>
    </div>
  );

};

CampaignSearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};

CampaignSearchForm.contextTypes = {
  locale: React.PropTypes.string.isRequired,
  formatPatterns: React.PropTypes.object.isRequired
};

export default reduxForm({
  form: SEARCH_CAMPAIGN_FORM
})(CampaignSearchForm);
