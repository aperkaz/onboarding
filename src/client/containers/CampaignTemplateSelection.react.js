import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalRenderComponent, ModalDialog } from '../components/common';
import { Api, TemplatePreview, TemplateForm, FileManager } from '../components/TemplateEditor';
import { Campaigns } from '../api';
import translations from './i18n';
import extend from 'extend';

class CampaignTemplateSelection extends ConditionalRenderComponent
{
    static propTypes = {
        type : PropTypes.oneOf(['email', 'landingpage']),
        campaignId : PropTypes.string.isRequired,
        customerId : PropTypes.string.isRequired,
        templateFileDirectory : PropTypes.string,
        selectedTemplate : PropTypes.string
    }

    static defaultState = {
        type : '',
        campaignId : '',
        campaign : { },
        customerId : '',
        templateFileDirectory : '',
        selectedTemplate : '',
        filesDirectory : ''
    }

    constructor(props)
    {
        super(props);

        this.campaignsApi = new Campaigns();

        const templateFileDirectory = `/public/c_${this.props.customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;

        this.templateFileDirectory = this.props.templateFileDirectory || templateFileDirectory;
        this.createTemplateModal = null;
        this.templateForm = null;
        this.fileManager = null;
        this.validationMessage = null;

        const basicState = {
            selectedTemplate : this.props.selectedTemplate,
            templates : [ ]
        };

        this.state = extend(false, CampaignTemplateSelection.defaultState, this.props, basicState);
    }

    componentDidMount()
    {
        this.context.i18n.register('CampaignTemplateSelection', translations);
        this.reload();
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
        const campaignLang = this.state.campaign.languageId;

        return Api.getTemplates(this.props.customerId).filter(t =>
        {
            return t.type === this.props.type && (!campaignLang || t.languageId === campaignLang);
        })
        .then(templates => this.setState({ templates }));
    }

    loadCampaign(campaignId)
    {
        const { showNotification } = this.context;
        campaignId = campaignId || this.state.campaignId;

        if(campaignId)
        {
            return this.campaignsApi.getCampaign(campaignId).then(campaign =>
            {
                if(this.props.type === 'email')
                    this.setState({ campaign, selectedTemplate : campaign.emailTemplate });
                else
                    this.setState({ campaign, selectedTemplate : campaign.landingpageTemplate });
            })
            .then(() => true)
            .catch(e => showNotification(e.message, 'error', 10));
        }

        return Promise.resolve(false);
    }

    reload()
    {
        return this.updateTemplateList().then(() => this.loadCampaign());
    }

    handleChoice(e)
    {
        const selectedTemplate = e.target.value;
        this.setState({ selectedTemplate });
    }

    showCreateTemplateModal()
    {
        this.setState({ filesDirectory : null });
        $(`[href="#${this.getComponentId()}_Tab1"]`).tab('show');

        const { i18n } = this.context;
        const title = i18n.getMessage('CampaignTemplateSelection.createTemplateModal.title');
        const buttons = {
            'save' : i18n.getMessage('System.save'),
            'cancel' : i18n.getMessage('System.close')
        };

        const onButtonClick = (button) =>
        {
            if(button === 'save')
            {
                return this.templateForm.saveForm().then(success =>
                {
                    if(success)
                    {
                        this.setState({ filesDirectory : this.templateForm.getFilesDirectory() });
                        this.updateTemplateList();
                        this.createTemplateModal.reload();
                        this.templateForm.loadTemplates();
                    }

                    return false;
                });
            }
            else
            {
                this.createTemplateModal.hide();
                this.updateTemplateList();
            }
        }

        this.templateForm.clearForm();
        this.createTemplateModal.show(title, undefined, onButtonClick, buttons);
    }

    validateForm()
    {
        const { selectedTemplate } = this.state;
        return selectedTemplate && (selectedTemplate + '').length > 0;
    }

    saveTemplateSelection = () =>
    {
        const { hideNotification, showNotification, i18n } = this.context;

        this.validationMessage && hideNotification(this.validationMessage, 0);

        if(this.validateForm())
        {
            const config = this.props.type === 'email' ?
                { emailTemplate : this.state.selectedTemplate } :
                { landingpageTemplate : this.state.selectedTemplate };

            config.campaignId = this.props.campaignId;

            return this.campaignsApi.updateCampaign(this.props.campaignId, config)
                .then(() => showNotification(i18n.getMessage('CampaignTemplateSelection.notification.save.success'), 'success'))
                .then(() => true)
                .catch(e => showNotification(i18n.getMessage('CampaignTemplateSelection.notification.save.failure', { error : e.message }), 'error'));
        }
        else
        {
            this.validationMessage = showNotification(i18n.getMessage('CampaignTemplateSelection.validation.template.required'), 'warning', 10);
        }

        return Promise.resolve(false);
    }

    handleDeleteFiles(e)
    {
        e.preventDefault();
        return this.fileManager.deleteSelectedItems();
    }

    handleUploadFile(e)
    {
        e.preventDefault();
        this.fileManager.showUploadFileDialog();
    }

    handleCopyTemplate(templateId)
    {
        this.templateForm.clearForm();
        this.templateForm.applyTemplate(templateId);
        this.showCreateTemplateModal();
    }

    handleEditTemplate(templateId)
    {
        this.templateForm.loadTemplate(templateId);
        this.showCreateTemplateModal();
    }

    render()
    {
        const { templates, selectedTemplate, filesDirectory } = this.state;
        const { i18n } = this.context;
        const titleKey = `CampaignTemplateSelection.title.${this.props.type}`;
        const tabNames = [ this.getComponentId() + '_Tab1', this.getComponentId() + '_Tab2' ];

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
                                        previewScale={0.5}
                                        allowEdit={template.customerId != null}
                                        onCopy={id => this.handleCopyTemplate(id)}
                                        onEdit={id => this.handleEditTemplate(id)} />
                                    <label className="radio-inline">
                                        <input type="radio" value={template.id} checked={template.id == selectedTemplate} onChange={(e) => this.handleChoice(e)} />
                                        {template.name}
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>

                <ModalDialog
                    ref={node => this.createTemplateModal = node}
                    size="large">
                    <div className="row">
                        <div className="col-sm-12">
                            <ul className="nav nav-tabs template-form">
                                <li className="active"><a data-toggle="tab" href={`#${tabNames[0]}`}>{i18n.getMessage('CampaignTemplateSelection.title.template')}</a></li>
                                <li className={filesDirectory ? '' : 'disabled'}><a data-toggle="tab" href={`#${tabNames[1]}`}>{i18n.getMessage('CampaignTemplateSelection.title.files')}</a></li>
                            </ul>
                            <div className="tab-content">
                                <div id={`${tabNames[0]}`} className="tab-pane fade in active">
                                    <div className="row">
                                        <div className="col-xs-12">
                                            <TemplateForm
                                                ref={node => this.templateForm = node}
                                                customerId={this.props.customerId}
                                                templateFileDirectory={this.templateFileDirectory}
                                                type={this.props.type}
                                                allowCopy={false} />
                                        </div>
                                    </div>
                                </div>
                                <div id={`${tabNames[1]}`} className="tab-pane fade">
                                    <div className="row">
                                        <div className="col-xs-12">
                                            {
                                                filesDirectory && filesDirectory.length &&
                                                    <div className="col-md-12">
                                                        <FileManager
                                                            ref={node => this.fileManager = node}
                                                            tenantId={'c_' + this.props.customerId}
                                                            filesDirectory={filesDirectory}
                                                            onUpload={() => this.templateForm.reload()}/>
                                                    </div>
                                            }
                                        </div>
                                        <div className="col-xs-12">
                                            <div className="text-right">
                                                <button type="button" className="btn btn-default" onClick={e => this.handleDeleteFiles(e)}>{i18n.getMessage('System.delete')}</button>
                                                <button type="button" className="btn btn-primary" onClick={e => this.handleUploadFile(e)}>{i18n.getMessage('System.upload')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalDialog>
            </div>
        );
    }
}

export default CampaignTemplateSelection;
