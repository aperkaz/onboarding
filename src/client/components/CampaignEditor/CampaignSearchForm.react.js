import React, {Component, PropTypes} from 'react';
import { Field, reduxForm } from 'redux-form';
import {SEARCH_CAMPAIGN_FORM} from '../../constants/forms';

class CampaignSearchForm extends Component {

    static propTypes = {
        onSearch: PropTypes.func.isRequired,
        onCreate: PropTypes.func.isRequired
    };

    renderTextInput = (field) => {
            return(
                <div className="form-group">
                    <label className="col-sm-3 control-label" htmlFor={field.name}>{field.label}</label>
                    <div className="col-sm-1 text-right"></div>
                    <div className="col-sm-8">
                        <input {...field.input} className="form-control" name={field.name} type="text"/>
                    </div>
                </div>
            );
    };

    render(){
        return(
            <div className="form-horizontal">
                <h1>
                    Search Campaigns
                </h1>
                <div className="row">
                    <div className="col-md-8">
                        <Field label='Campaign Id' name="campaignId" component={this.renderTextInput}/>
                        <Field label='Status' name="status" component={this.renderTextInput}/>
                        <Field label='Campaign Type' name="campaignType" component={this.renderTextInput}/>
                        <Field label='Owner' name="owner" component={this.renderTextInput}/>
                    </div>
                </div>

                <div className="form-submit text-right">
                    <div className="form-inline">
                        <button className="btn btn-link" type="button" onClick={() => this.props.reset(SEARCH_CAMPAIGN_FORM)}>
                            Reset
                        </button>
                        <button className="btn btn-default" type="button" onClick={this.props.onCreate}>
                            Create
                        </button>
                        <button className="btn btn-primary" type="button" onClick={this.props.onSearch}>
                            Search
                        </button>
                    </div>
                </div>

                <hr/>
            </div>
        );
    }
}

export default reduxForm({
    form: SEARCH_CAMPAIGN_FORM
})(CampaignSearchForm);
