import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../components-ng/common';
import { Api, TemplatePreview, TemplateForm } from '../components-ng/TemplateEditor';
import ajax from 'superagent-bluebird-promise';
import translations from './i18n';
import extend from 'extend';

class CampaignTemplateSelection extends ContextComponent
{
    static propTypes = {
        type : PropTypes.oneOf(['email', 'landingpage']),
        campaignId : PropTypes.string.isRequired,
        customerId : PropTypes.string.isRequired,
        templateFileDirectory : PropTypes.string,
        selectedTemplate : PropTypes.string,
        prevViewLink : PropTypes.string.isRequired,
        nextViewLink : PropTypes.string.isRequired
    }

    static defaultState = {
        type : '',
        campaignId : '',
        customerId : '',
        templateFileDirectory : '',
        selectedTemplate : '',
        prevViewLink : '',
        nextViewLink : ''
    }

    constructor(props)
    {
        super(props);

        const templateFileDirectory = `/public/c_${this.props.customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;

        this.templateFileDirectory = this.props.templateFileDirectory || templateFileDirectory;
        this.createTemplateModal = null;
        this.templateForm = null;

        const basicState = {
            selectedTemplate : this.props.selectedTemplate,
            templates : [ ]
        };

        this.state = extend(false, CampaignTemplateSelection.defaultState, this.props, basicState);
    }

    componentDidMount()
    {
        this.updateTemplateList();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        const nextState = { };
        let updateState = false;

        for(let key in nextPops)
        {
            if(this.props[key] != nextPops[key])
            {
                nextState[key] = nextPops[key];
                updateState = true;
            }
        }

        if(updateState)
        {
            this.setState(nextState);
            this.updateTemplateList();
        }
    }

    updateTemplateList()
    {
        return Api.getTemplates(this.props.customerId).filter(t => t.type === this.props.type)
            .then(templates => this.setState({ templates }));
    }

    handleBack(e)
    {
        e.preventDefault();

        this.context.router.push(this.props.prevViewLink);
    }

    handleSave(e)
    {
        e.preventDefault();

        this.saveTemplateSelection().then(() => this.context.router.push(this.props.nextViewLink));
    }

    handleCreateTemplate(e)
    {
        e.preventDefault();

        this.templateForm.clearForm();
        this.createTemplateModal.show();
    }

    handleChoice(e)
    {
        const selectedTemplate = e.target.value;
        this.setState({ selectedTemplate });
    }

    handleTemplateSave()
    {
        this.createTemplateModal.show();
        return this.updateTemplateList();
    }

    handleTemplateCancel()
    {
        this.createTemplateModal.hide();
        return this.updateTemplateList();
    }

    saveTemplateSelection = () =>
    {
        const config = this.props.type === 'email' ?
            { emailTemplate : this.state.selectedTemplate } :
            { landingpageTemplate : this.state.selectedTemplate };

        config.campaignId = this.props.campaignId;

        return ajax.put('/onboarding/api/campaigns/' + this.props.campaignId)
            .set('Content-Type', 'application/json')
            .send(config)
            .then(() => this.context.showNotification('campaignEditor.template.message.success.saving', 'success'))
            .catch(() => this.context.showNotification('campaignEditor.template.message.error.saving', 'error'));
    }

    render()
    {
        const { templates, selectedTemplate } = this.state;
        const { i18n } = this.context;
        const titleKey = `CampaignTemplateSelection.title.${this.props.type}`;

        i18n.register('CampaignTemplateSelection', translations);

        return(
            <div className="form-horizontal">
                <h1>{i18n.getMessage(titleKey)}</h1>
                <div className="row">
                    {
                        templates.map(template =>
                        {
                            return(
                                <div className="col-md-4 text-center template-preview" key={template.id}>
                                    <TemplatePreview
                                        templateId={template.id}
                                        customerId={this.props.customerId}
                                        allowFullPreview={true}
                                        previewScale={0.5} />
                                    <label>
                                        <input type="radio" name="template" value={template.id} checked={template.id == selectedTemplate} onChange={(e) => this.handleChoice(e)} />
                                        {template.name}
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>
                <br/>
                <div className="form-submit text-right">
                    <button className="btn btn-link" onClick={e => this.handleBack(e)}>{i18n.getMessage('CampaignTemplateSelection.button.previous')}</button>
                    <button className="btn btn-primary" onClick={e => this.handleCreateTemplate(e)}>{i18n.getMessage('CampaignTemplateSelection.button.createTemplate')}</button>&nbsp;
                    <button className="btn btn-primary" onClick={e => this.handleSave(e)}>{i18n.getMessage('CampaignTemplateSelection.button.next')}</button>
                </div>

                <ModalDialog
                    title={'Create new template'}
                    size="large"
                    ref={node => this.createTemplateModal = node}
                    showFooter={false}>
                    <div className="row">
                        <div className="col-sm-12">
                            <TemplateForm
                                ref={node => this.templateForm = node}
                                customerId={this.props.customerId}
                                templateFileDirectory={this.templateFileDirectory}
                                type={this.props.type}
                                onCreate={() => this.handleTemplateSave()}
                                onUpdate={() => this.handleTemplateSave()}
                                onCancel={() => this.handleTemplateCancel()} />
                        </div>
                    </div>
                </ModalDialog>
            </div>
        );
    }
}

export default CampaignTemplateSelection;
