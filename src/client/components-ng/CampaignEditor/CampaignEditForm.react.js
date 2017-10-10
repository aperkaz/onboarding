import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker, ContextComponent } from '../common';
import { Campaigns } from '../../api';
import extend from 'extend';
import translations from './i18n';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import validate from 'validate.js';
import ClipboardButton from 'react-clipboard.js';

class CampaignEditForm extends ContextComponent
{
    static propTypes = {
        campaignId : React.PropTypes.string,
        customerId : React.PropTypes.string.isRequired
    }

    static emptyFormItem = {
        id : 0,
        campaignId : null,
        description : '',
        startsOn : '',
        endsOn : '',
        status : 'new',
        campaignType : 'eInvoiceSupplierOnboarding',
        customerId : '',
        languageId : '',
        countryId : '',
        invitationCode : ''
    }

    static campaignConstraints = {
        campaignId : {
            presence : {
                message: 'CampaignEditForm.error.campaignId.presence'
            },
            format : {
                pattern : /^[a-z][a-z0-9-]*[^-]$/,
                message : 'CampaignEditForm.error.campaignId.format'
            },
            length : {
                maximum : 30,
                message : 'CampaignEditForm.error.campaignId.length'
            }
        },
        description : {
            presence : {
                message : 'CampaignEditForm.error.description.presence'
            },
            length : {
                maximum : 50,
                message : 'CampaignEditForm.error.description.length'
            }
        },
        campaignType : {
            presence : {
                message : 'CampaignEditForm.error.campaignType.presence'
            }
        },
        status : {
            presence : {
                message : 'CampaignEditForm.error.status.presence'
            }
        }
    }

    constructor(props)
    {
        super(props)

        const basicState = { errors : { } }

        this.state = extend(false, { }, CampaignEditForm.emptyFormItem, basicState);
        this.formChanged = false;

        const serviceRegistry = (service) => ({ url: '/isodata' });

        this.LanguageField = serviceComponent({ serviceRegistry, serviceName : 'isodata', moduleName : 'isodata-languages', jsFileName : 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata', moduleName : 'isodata-countries', jsFileName : 'countries-bundle' });
        this.campaignsApi = new Campaigns();
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignEditForm', translations);
    }

    componentDidMount()
    {
        return this.reload();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(nextPops.campaignId != this.props.campaignId)
            return this.loadCampaign(nextPops.campaignId);
    }

    reload()
    {
        return this.loadCampaign(this.props.campaignId);
    }

    handleOnChange(e, fieldName)
    {
        this.formChanged = true;

        if(typeof e === 'object')
            this.setState({ [fieldName] : e.target.value });
        else
            this.setState({ [fieldName] : e });
    }

    handleInvitationCodeChange(e)
    {
        if(e.target.checked)
            this.loadInvitationCode();
        else
            this.setState({ invitationCode : null });
    }

    getItemFromState()
    {
        let { id, campaignId, description, startsOn, endsOn, status, campaignType,
            customerId, languageId, countryId, invitationCode } = this.state;

        if(!description)
            description = null;
        if(!startsOn)
            startsOn = null;
        if(!endsOn)
            endsOn = null;

        return { id, campaignId, description, startsOn, endsOn, status, campaignType,
            customerId, languageId, countryId, invitationCode };
    }

    putItemToState(item)
    {
        this.setState(extend(false, { }, this.state, item));
    }

    translateValidationErrors(errors)
    {
        const { i18n } = this.context;
        const translated = { };

        for(let key in errors)
            translated[key] = i18n.getMessage(errors[key]);

        return translated;
    }

    validateForm()
    {
        const errors = validate(this.getItemFromState(), CampaignEditForm.campaignConstraints, { fullMessages : false });

        if(errors)
        {
            for(let key in errors)
            {
                if(Array.isArray(errors[key]))
                    errors[key] = errors[key][0];
            }

            this.setState({ errors : this.translateValidationErrors(errors) });
            return false;
        }

        this.setState({ errors : { } });
        return true;
    }

    loadCampaign(campaignId)
    {
        return this.campaignsApi.getCampaign(campaignId).then(campaign => this.putItemToState(campaign));
    }

    saveCampaign()
    {
        if(this.validateForm())
        {
            const campaign = this.getItemFromState();

            if(campaign.id)
            {
                return this.campaignsApi.updateCampaign(campaign.campaignId, campaign)
                    .then(item => this.putItemToState(item)).then(() => this.formChanged = false)
                    .then(() => this.state.campaignId);
            }
            else
            {
                return this.campaignsApi.addCampaign(campaign)
                    .then(item => this.putItemToState(item)).then(() => this.formChanged = false)
                    .then(() => this.state.campaignId);
            }
        }
        else
        {
            return Promise.resolve(false);
        }
    }

    clearForm()
    {
        this.putItemToState(CampaignEditForm.emptyFormItem);
        this.setState({ errors : { } });
        this.formChanged = false;
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

    loadInvitationCode()
    {
        const { showNotifiction } = this.state;

        return this.campaignsApi.getInvitationCode()
            .then(invitationCode => this.setState({ invitationCode }))
            .catch(e => showNotifiction(e.message, 'error', 10));
    }

    render()
    {
        const { i18n, locale } = this.context;
        const { errors } = this.state;

        return(
            <div className="form-horizontal">
                <h1>{i18n.getMessage('CampaignEditForm.header.createCampaign')}</h1>
                <div className="row">
                    <div className="col-xs-12 col-md-10 col-lg-8">
                        <div className={this.getFormGroupClass('campaignId')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignEditForm.label.campaignId')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" disabled={this.state.id} value={this.state.campaignId} onChange={e => this.handleOnChange(e, 'campaignId')} />
                                { errors.campaignId && <span className="label label-danger">{errors.campaignId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('description')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignEditForm.label.description')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" value={this.state.description} onChange={e => this.handleOnChange(e, 'description')} />
                                { errors.description && <span className="label label-danger">{errors.description}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass(['startsOn', 'endsOn'])}>
                              <label className="control-label col-sm-3">{i18n.getMessage('CampaignEditForm.label.startsOn')}</label>
                              <div className="col-sm-1 text-right"></div>
                              <div className="col-sm-8">
                                    <div className="input-group">
                                          <DatePicker showIcon={false} value={this.state.startsOn} onChange={val => this.handleOnChange(val.dateString, 'startsOn')} />
                                          { errors.startsOn && <span className="label label-danger">{errors.startsOn}</span> }
                                          <span className="input-group-addon">—</span>
                                          <DatePicker showIcon={false} value={this.state.endsOn} onChange={val => this.handleOnChange(val.dateString, 'endsOn')} />
                                          { errors.endsOn && <span className="label label-danger">{errors.endsOn}</span> }
                                    </div>
                              </div>
                        </div>
                        <div className={this.getFormGroupClass('status')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignEditForm.label.status')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" disabled={true} value={this.state.status} onChange={e => this.handleOnChange(e, 'status')} />
                                { errors.status && <span className="label label-danger">{errors.status}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('campaignType')}>
                            <div className="col-sm-3">
                                <label className="control-label">{i18n.getMessage('CampaignEditForm.label.campaignType')}</label>
                            </div>
                            <div className="col-sm-1"></div>
                            <div className="col-sm-8">
                                <select className="form-control" onChange={e => this.handleOnChange(e, 'campaignType')} value={this.state.campaignType}>
                                    <option value="eInvoiceSupplierOnboarding">eInvoiceSupplierOnboarding</option>
                                </select>
                                { errors.campaignType && <span className="label label-danger">{errors.campaignType}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('owner')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignEditForm.label.owner')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" disabled={true} />
                                { errors.owner && <span className="label label-danger">{errors.owner}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('country')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignEditForm.label.country')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-8">
                                <this.CountryField optional={true} locale={locale} value={this.state.countryId} onChange={e => this.handleOnChange(e, 'countryId')} />
                                { errors.countryId && <span className="label label-danger">{errors.countryId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('language')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignEditForm.label.language')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-8">
                                <this.LanguageField optional={true} locale={locale} value={this.state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                                { errors.languageId && <span className="label label-danger">{errors.languageId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('invitationCode')}>
                            <label className="col-sm-3 control-label">{i18n.getMessage('CampaignEditForm.label.invitationCode')}</label>
                            <div className="col-sm-1 text-right"></div>
                            <div className="col-sm-1">
                                <input type="checkbox" value="on" disabled={this.state.id} checked={this.state.invitationCode} onChange={e => this.handleInvitationCodeChange(e)} />
                                { errors.invitationCode && <span className="label label-danger">{errors.invitationCode}</span> }
                            </div>
                            <div className="col-sm-7">
                                {
                                    this.state.invitationCode &&
                                    <span className="input-group">
                                        <input type="text" className="form-control" id="link" readOnly={true} defaultValue={`${document.origin}/onboarding/public/landingpage/c_${this.state.customerId}/${this.state.campaignId}`} />
                                        <span className="input-group-btn">
                                            <ClipboardButton className="btn btn-default" data-clipboard-target="#link">
                                                <i className="fa fa-clipboard" aria-hidden="true"></i>
                                            </ClipboardButton>
                                        </span>
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CampaignEditForm;
