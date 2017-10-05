import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, DatePicker, ModalDialog } from '../common';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import translations from './i18n';
import extend from 'extend';

class CampaignSearchForm extends ContextComponent
{
    static propTypes = {
        customerId : PropTypes.string.isRequired
    }

    static emptyFormItem = {
        campaignId : '',
        startsOn : '',
        endsOn : '',
        status : 'new',
        campaignType : 'eInvoiceSupplierOnboarding',
        countryId : '',
        languageId : ''
    }

    constructor(props)
    {
        super(props);

        this.state = {
            errors : { }
        }

        const serviceRegistry = (service) => ({ url: '/isodata' });

        this.LanguageField = serviceComponent({ serviceRegistry, serviceName : 'isodata', moduleName : 'isodata-languages', jsFileName : 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata', moduleName : 'isodata-countries', jsFileName : 'countries-bundle' });
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignSearchForm', translations);
    }

    getItemFromState()
    {
        const { campaignId, startsOn, endsOn, status, campaignType, countryId, languageId } = this.state;
        return { campaignId, startsOn, endsOn, status, campaignType, countryId, languageId };
    }

    putItemToState(item)
    {
        this.setState(extend(false, { }, this.state, item));
    }

    clearForm()
    {
        this.putItemToState(CampaignSearchForm.emptyFormItem);
        this.setState({ errors : { } });
    }

    handleOnChange(e, fieldName)
    {
        this.formChanged = true;

        if(typeof e === 'object')
            this.setState({ [fieldName] : e.target.value });
        else
            this.setState({ [fieldName] : e });
    }

    getFormGroupClass(fields)
    {
        const { errors } = this.state;
        let hasError = false;

        if(Array.isArray(fields))
            hasError = fields.reduce((all, val) => all || val in errors, false);
        else
            hasError = fields in errors;

        return hasError ? 'form-group has-error' : 'form-group';
    }

    render()
    {
        const state = this.state;
        const { i18n, locale } = this.context;
        const { errors } = state;

        return(
            <div className="form-horizontal">
                <div className="row">
                    <div className="col-xs-12 col-md-6">
                        <div className={this.getFormGroupClass('campaignId')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignSearchForm.label.campaignId')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" value={state.campaignId} onChange={e => this.handleOnChange(e, 'campaignId')} />
                                { errors.campaignId && <span className="label label-danger">{errors.campaignId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass(['startsOn', 'endsOn'])}>
                              <label className="control-label col-sm-3">{i18n.getMessage('CampaignSearchForm.label.startsOn')}</label>
                              <div className="col-sm-1 text-right"></div>
                              <div className="col-sm-8">
                                    <div className="input-group">
                                          <DatePicker showIcon={false} value={state.startsOn} onChange={val => this.handleOnChange(val.dateString, 'startsOn')} />
                                          { errors.startsOn && <span className="label label-danger">{errors.startsOn}</span> }
                                          <span className="input-group-addon">—</span>
                                          <DatePicker showIcon={false} value={state.endsOn} onChange={val => this.handleOnChange(val.dateString, 'endsOn')} />
                                          { errors.endsOn && <span className="label label-danger">{errors.endsOn}</span> }
                                    </div>
                              </div>
                        </div>
                        <div className={this.getFormGroupClass('status')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignSearchForm.label.status')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" value={state.status} onChange={e => this.handleOnChange(e, 'status')} />
                                { errors.status && <span className="label label-danger">{errors.status}</span> }
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 col-md-6">
                        <div className={this.getFormGroupClass('campaignType')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignSearchForm.label.campaignType')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" value={state.campaignType} onChange={e => this.handleOnChange(e, 'campaignType')} />
                                { errors.campaignType && <span className="label label-danger">{errors.campaignType}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('country')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignSearchForm.label.country')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-8">
                                <this.CountryField optional={true} locale={locale} value={this.state.countryId} onChange={e => this.handleOnChange(e, 'countryId')} />
                                { errors.countryId && <span className="label label-danger">{errors.countryId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('language')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignSearchForm.label.language')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-8">
                                <this.LanguageField optional={true} locale={locale} value={this.state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                                { errors.languageId && <span className="label label-danger">{errors.languageId}</span> }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CampaignSearchForm;
