import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalRenderComponent } from '../common';
import { Contacts } from '../../api';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import extend from 'extend';
import translations from './i18n';
import validate from 'validate.js';

class CampaignContactForm extends ConditionalRenderComponent
{
    static propTypes = {
        contactId : PropTypes.string,
        campaignId : PropTypes.string
    }

    static emptyFormItem = {
        id : 0,
        email : '',
        status : 'new',
        campaignId : '',
        companyName : '',
        contactFirstName : '',
        contactLastName : '',
        address : '',
        dunsNo : '',
        telephone : '',
        cell : '',
        supplierId : null,
        customerSupplierId : '',
        zipCode : '',
        city : '',
        country : '',
        pobox : '',
        commercialRegisterNo : '',
        taxIdentNo : '',
        vatIdentNo : ''
    }

    static contactConstraints = {
        email : {
            presence : {
                message: 'CampaignContactForm.error.email.presence'
            }
        },
        companyName : {
            presence : {
                message: 'CampaignContactForm.error.companyName.presence'
            }
        },
        contactFirstName : {
            presence : {
                message: 'CampaignContactForm.error.firstName.presence'
            }
        },
        contactLastName : {
            presence : {
                message: 'CampaignContactForm.error.lastName.presence'
            }
        }
    }

    constructor(props)
    {
        super(props);

        const basicState = {
            errors : { },
            campaignId : props.campaignId
        }

        this.state = extend(false, { }, basicState, CampaignContactForm.emptyFormItem, props);

        const serviceRegistry = (service) => ({ url: '/isodata' });

        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata', moduleName : 'isodata-countries', jsFileName : 'countries-bundle' });
        this.contactsApi = new Contacts();
        this.formChanged = false;
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignContactForm', translations);
    }

    componentDidMount()
    {
        if(this.state.contactId)
            this.loadContact(this.state.contactId);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        const propsChanged = Object.keys(nextPops).reduce((all, key) => all || nextPops[key] !== this.props[key], false);

        if(propsChanged)
            this.setState(extend(false, { }, this.state, nextPops));
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

    handleOnChange(e, fieldName)
    {
        this.formChanged = true;

        if(typeof e === 'object')
            this.setState({ [fieldName] : e.target.value });
        else
            this.setState({ [fieldName] : e });
    }

    getItemFromState()
    {
        const item = { };

        for(let key in CampaignContactForm.emptyFormItem)
            item[key] = this.state[key];

        return item;
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
        const errors = validate(this.getItemFromState(), CampaignContactForm.contactConstraints, { fullMessages : false });

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

    loadContact(contactId, campaignId)
    {
        if(!contactId)
            contactId = this.state.contactId;
        if(!campaignId)
            campaignId = this.state.campaignId;

        this.resetForm();

        return this.contactsApi.getContact(campaignId, contactId)
            .then(contact => this.putItemToState(contact))
            .then(() => this.setState({ campaignId }))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    saveContact()
    {
        if(this.validateForm())
        {
            const contact = this.getItemFromState();

            if(contact.id)
            {
                return this.contactsApi.updateContact(this.state.campaignId, contact.id, contact)
                    .then(item => this.putItemToState(item)).then(() => this.formChanged = false)
                    .then(() => true);
            }
            else
            {
                return this.contactsApi.addContact(this.state.campaignId, contact)
                    .then(item => this.putItemToState(item)).then(() => this.formChanged = false)
                    .then(() => true);
            }
        }
        else
        {
            return Promise.resolve(false);
        }
    }

    resetForm()
    {
        const basicState = {
            errors : { },
            campaignId : this.state.campaignId
        }

        this.setState(extend(false, { }, this.state, CampaignContactForm.emptyFormItem, basicState));
        this.formChanged = false;
    }

    render()
    {
        const { i18n, locale } = this.context;
        const { errors } = this.state;

        return(
            <div className="form-horizontal">
                <div className="row">
                    <div className="col-md-12">
                        <div className={this.getFormGroupClass('email')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.email')}</label>
                            <div className="col-sm-8">
                                <input type="text" disabled={this.state.id} value={this.state.email} onChange={e => this.handleOnChange(e, 'email')} className="form-control" />
                                { errors.email && <span className="label label-danger">{errors.email}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('status')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.status')}</label>
                            <div className="col-sm-8">
                                <input type="text" disabled={true} value={this.state.status} onChange={e => this.handleOnChange(e, 'status')} className="form-control" />
                                { errors.status && <span className="label label-danger">{errors.status}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('companyName')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.companyName')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.companyName} onChange={e => this.handleOnChange(e, 'companyName')} className="form-control" />
                                { errors.companyName && <span className="label label-danger">{errors.companyName}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('contactFirstName')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.firstName')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.contactFirstName} onChange={e => this.handleOnChange(e, 'contactFirstName')} className="form-control" />
                                { errors.contactFirstName && <span className="label label-danger">{errors.contactFirstName}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('contactLastName')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.lastName')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.contactLastName} onChange={e => this.handleOnChange(e, 'contactLastName')} className="form-control" />
                                { errors.contactLastName && <span className="label label-danger">{errors.contactLastName}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('address')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.address')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.address} onChange={e => this.handleOnChange(e, 'address')} className="form-control" />
                                { errors.address && <span className="label label-danger">{errors.address}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('commercialRegisterNo')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.poBox')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.pobox} onChange={e => this.handleOnChange(e, 'pobox')} className="form-control" />
                                { errors.pobox && <span className="label label-danger">{errors.pobox}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('zipCode')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.zipCode')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.zipCode} onChange={e => this.handleOnChange(e, 'zipCode')} className="form-control" />
                                { errors.zipCode && <span className="label label-danger">{errors.zipCode}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('city')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.city')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.city} onChange={e => this.handleOnChange(e, 'city')} className="form-control" />
                                { errors.city && <span className="label label-danger">{errors.city}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('country')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.country')}</label>
                            <div className="col-sm-8">
                                <this.CountryField optional={true} locale={locale} value={this.state.country} onChange={e => this.handleOnChange(e, 'country')} />
                                { errors.country && <span className="label label-danger">{errors.country}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('commercialRegisterNo')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.commercialRegisterNo')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.commercialRegisterNo} onChange={e => this.handleOnChange(e, 'commercialRegisterNo')} className="form-control" />
                                { errors.commercialRegisterNo && <span className="label label-danger">{errors.commercialRegisterNo}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('taxIdentNo')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.taxIdentNo')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.taxIdentNo} onChange={e => this.handleOnChange(e, 'taxIdentNo')} className="form-control" />
                                { errors.taxIdentNo && <span className="label label-danger">{errors.taxIdentNo}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('vatIdentNo')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.vatIdentNo')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.vatIdentNo} onChange={e => this.handleOnChange(e, 'vatIdentNo')} className="form-control" />
                                { errors.vatIdentNo && <span className="label label-danger">{errors.vatIdentNo}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('dunsNo')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.dunsNo')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.dunsNo} onChange={e => this.handleOnChange(e, 'dunsNo')} className="form-control" />
                                { errors.dunsNo && <span className="label label-danger">{errors.dunsNo}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('telephone')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.telephone')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.telephone} onChange={e => this.handleOnChange(e, 'telephone')} className="form-control" />
                                { errors.telephone && <span className="label label-danger">{errors.telephone}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('cell')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.mobilePhone')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.cell} onChange={e => this.handleOnChange(e, 'cell')} className="form-control" />
                                { errors.cell && <span className="label label-danger">{errors.cell}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('customerSupplierId')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.customerSupplierId')}</label>
                            <div className="col-sm-8">
                                <input type="text" value={this.state.customerSupplierId} onChange={e => this.handleOnChange(e, 'customerSupplierId')} className="form-control" />
                                { errors.customerSupplierId && <span className="label label-danger">{errors.customerSupplierId}</span> }
                            </div>
                        </div>
                        <div className={this.getFormGroupClass('supplierId')}>
                            <label className="col-sm-4 control-label">{i18n.getMessage('CampaignContactForm.label.supplierId')}</label>
                            <div className="col-sm-8">
                                <input type="text" disabled={true} value={this.state.supplierId} onChange={e => this.handleOnChange(e, 'supplierId')} className="form-control" />
                                { errors.supplierId && <span className="label label-danger">{errors.supplierId}</span> }
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CampaignContactForm;
