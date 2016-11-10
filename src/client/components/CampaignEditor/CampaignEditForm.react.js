import React, { Component, PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { CREATE_CAMPAIGN_FORM } from '../../constants/forms';
import _ from 'lodash';

class CampaignEditForm extends Component {

    static propTypes = {
        onCreateCampaign: PropTypes.func.isRequired
    };

    renderTextInput = (field) => {
        const {meta: { touched, error }} = field;
        let hasError = !_.isEmpty(error) && touched;
        return (
            <div className={`form-group ${hasError? 'has-error' : ''}`}>
                <label className="col-sm-2 control-label" htmlFor={field.name}>{field.label}</label>
                <div className="col-sm-1 text-right"></div>
                <div className="col-sm-9">
                    <input {...field.input} className="form-control" name={field.name} type="text"/>
                </div>
                {hasError? <div className="col-sm-offset-3 col-sm-9">
                  <span className="label label-danger">
                      {error}
                  </span>
                </div> : null}
            </div>
        );
    };

    render() {
        return (
            <div className="form-horizontal">
                <h1>
                    Create Campaign
                </h1>
                <div className="row">
                    <div className="col-md-8">
                        <Field label='Campaign Id' name="campaignId" component={this.renderTextInput}/>
                        <Field label='Description' name="description" component={this.renderTextInput}/>
                        <Field label='Status' name="status" component={this.renderTextInput}/>
                        <Field label='Campaign Type' name="campaignType" component={this.renderTextInput}/>
                        <Field label='Owner' name="owner" component={this.renderTextInput}/>
                    </div>
                </div>
                <div className="form-submit text-right">
                    <button className="btn btn-link">
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={this.props.onCreateCampaign}>
                        Create
                    </button>
                </div>
            </div>
        );
    }
}

const validate = (values) => {
    const errors = {};
    if (_.size(values.campaignId) <= 0) {
        errors.campaignId = 'Required'
    }
    return errors;
};

export default reduxForm({
    form: CREATE_CAMPAIGN_FORM,
    validate
})(CampaignEditForm);