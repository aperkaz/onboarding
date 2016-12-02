import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { SEARCH_CAMPAIGN_FORM } from '../../constants/forms';
import ReduxFormDateRange from '../common/ReduxFormDateRange.react';
import { injectIntl, intlShape } from 'react-intl';

// this function should be defined outside of CampaignSearchForm to avoid re-rendering
const renderTextInput = (field) => {
  return (
    <div className="form-group">
      <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
      <div className="col-sm-1 text-right" />
      <div className="col-sm-8">
        <input {...field.input} className="form-control" name={field.name} type="text"/>
      </div>
    </div>
  );
};

const CampaignSearchForm = ({ onSearch, onCreate, reset, intl }) => {
  const renderActionToolbar = () => {
    return (
      <div className="form-submit text-right">
        <div className="form-inline">
          <button className="btn btn-link" type="button"
            onClick={() => reset(SEARCH_CAMPAIGN_FORM)}
          >
            {intl.formatMessage({ id: 'campaignEditor.searchForm.button.reset' })}
          </button>
          <button className="btn btn-default" type="button" onClick={onCreate}>
            {intl.formatMessage({ id: 'campaignEditor.searchForm.button.create' })}
          </button>
          <button className="btn btn-primary" type="button" onClick={onSearch}>
            {intl.formatMessage({ id: 'campaignEditor.searchForm.button.search' })}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="form-horizontal">
      <h1>
        {intl.formatMessage({ id: 'campaignEditor.searchForm.header' })}
      </h1>
      <div className="row">
        <div className="col-md-8">
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.searchForm.campaignId.label' })}
            name='campaignId'
            component={renderTextInput}
          />
          <ReduxFormDateRange
            fromFieldName="startsOn"
            toFieldName="endsOn"
            label={intl.formatMessage({ id: 'campaignEditor.searchForm.endsStartsOn.label' })}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.searchForm.status.label' })}
            name="status"
            component={renderTextInput}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.searchForm.campaignType.label' })}
            name="campaignType"
            component={renderTextInput}
          />
          <Field
            label={intl.formatMessage({ id: 'campaignEditor.searchForm.owner.label' })}
            name="owner"
            component={renderTextInput}
          />
        </div>
      </div>
      {renderActionToolbar()}
      <hr/>
    </div>
  );
};

CampaignSearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

CampaignSearchForm.contextTypes = {
  locale: React.PropTypes.string.isRequired,
  formatPatterns: React.PropTypes.object.isRequired
};

export default reduxForm({
  form: SEARCH_CAMPAIGN_FORM
})(injectIntl(CampaignSearchForm));
