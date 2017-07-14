import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import _ from 'lodash';
import { connect } from 'react-redux';

import EmailTemplateDropzone from '../components/EmailTemplateDropzone.react';
import request from 'superagent-bluebird-promise';

@connect(state => ({
    currentUserData: state.currentUserData
}))
class CampaignEmailTemplate extends Component
{
    static propTypes = {
        type: React.PropTypes.oneOf(['email', 'onboarding']),
        router: React.PropTypes.object,
        campaignId: React.PropTypes.string.isRequired,
        intl: intlShape.isRequired
    }

    static contextTypes = {
        showNotification: React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            selectedTemplate: 1,
            templatePreview: <iframe width="400" height="300" src="/onboarding/preview/${this.props.campaignId}/template/email"></iframe>
        };
    }

    handleBack = () =>
    {
        if(this.props.type === 'email')
            this.props.router.push(`/edit/${this.props.campaignId}`);
        else
            this.props.router.push(`/edit/${this.props.campaignId}/template/email`);
    }

    handleSave = () =>
    {
        if(this.props.type === 'email')
            this.props.router.push(`/edit/${this.props.campaignId}/template/onboard`);
        else
            this.props.router.push(`/edit/${this.props.campaignId}/contacts`);
    }

    handleUploadSucceeded = () =>
    {
        document.getElementById('email-preview').src = `/onboarding/preview/${this.props.campaignId}/template/email`;
    }

    handleSelectTemplate = (e) =>
    {
        const value = e.target.value;
        this.setState({ selectedTemplate : value });
    }

    renderTemplate = () =>
    {
        const localType = this.props.type === 'email' ? 'email' : 'landingpage';
        const intl = this.props.intl;

        const style = { width: '800px', height: '600px', transform: 'scale(0.5)', transformOrigin: '0 0' };
        return(
            <div>
                <div style={{ width: '400px', height: '310px' }}>
                    <iframe id="email-preview" style={ style } src={ "/onboarding/preview/${this.props.campaignId}/template/" + localType }></iframe>
                </div>
                <div>
                    <label><input type="radio" value="generic" key="1" checked={ this.state.selectedTemplate == 1 } onChange={ this.handleSelectTemplate }/> { intl.formatMessage({id: 'campaignEditor.template.select'}) }</label>
                </div>
            </div>
        );
    }

    saveTemplateSelection = () =>
    {
        const config = this.props.type === 'email' ?
            { emailTemplate : this.state.selectedTemplate } :
            { landingpageTemplate : this.state.selectedTemplate };

        request.put('/onboarding/api/campaigns/' + this.props.campaignId)
            .set('Content-Type', 'application/json')
            .send(config)
            .then(() => this.context.showNotification('campaignEditor.template.message.success.saving', 'success'))
            .catch(() => this.context.showNotification('campaignEditor.template.message.error.saving', 'error'))
    }

    render()
    {
        const { type, intl } = this.props;

        return(
            <div className="form-horizontal">
                <h1>{intl.formatMessage({ id: 'campaignEditor.template.header' }, { type: _.upperFirst(type) })}</h1>
                <div className="row">
                    <div className="col-md-8">
                        { this.renderTemplate() }
                        {type === 'email' && (
                            <div>
                                <div style={{ float: 'left', paddingRight: 10 }}>
                                    <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} campaignType="eInvoiceSupplierOnboarding" templateType={type} templateName="generic" filename="logo" onSuccess={this.handleUploadSucceeded}/>
                                </div>
                                <div style={{ float: 'left' }}>
                                    <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} campaignType="eInvoiceSupplierOnboarding" templateType={type} templateName="generic" filename="header" onSuccess={this.handleUploadSucceeded}/>
                                </div>
                            </div>
                        )}
                        {type === 'onboarding' && (
                            <div>
                                <div style={{ float: 'left', paddingRight: 10 }}>
                                    <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} campaignType="eInvoiceSupplierOnboarding" templateType={type} templateName="generic" filename="logo"/>
                                </div>
                                <div style={{ float: 'left' }}>
                                    <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} campaignType="eInvoiceSupplierOnboarding" templateType={type} templateName="generic" filename="photo"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <br/>
                <div className="form-submit text-right">
                    <button className="btn btn-link" onClick={this.handleBack}>
                        { intl.formatMessage({ id: 'campaignEditor.steps.button.previous' }) }
                    </button>
                    <button className="btn btn-primary" disabled={true}>
                        { intl.formatMessage({ id: 'campaignEditor.steps.button.createTemplate' }) }
                    </button>
                    &nbsp;
                    <button className="btn btn-primary" onClick={this.handleSave}>
                        { intl.formatMessage({ id: 'campaignEditor.steps.button.savenext' }) }
                    </button>
                </div>
            </div>
        );
    }
}

export default injectIntl(CampaignEmailTemplate);
