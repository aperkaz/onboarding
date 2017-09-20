import React from 'react';
import ContextComponent from '../components-ng/common/ContextComponent.react';
import ModalDialog from '../components-ng/common/ModalDialog.react';
import { Api, TemplatePreview, TemplateForm } from '../components/TemplateEditor';
import ajax from 'superagent-bluebird-promise';

class CampaignTemplateSelection extends ContextComponent
{
    static propTypes = {
        type : React.PropTypes.oneOf(['email', 'landingpage']),
        campaignId : React.PropTypes.string.isRequired,
        customerId : React.PropTypes.string.isRequired,
        templateFileDirectory : React.PropTypes.string,
        selectedTemplate : React.PropTypes.string,
        prevViewLink : React.PropTypes.string.isRequired,
        nextViewLink : React.PropTypes.string.isRequired
    }

    constructor(props)
    {
        super(props);

        const templateFileDirectory = `/public/c_${this.props.customerId}/onboarding/campaigns/eInvoiceSupplierOnboarding/`;

        this.templateFileDirectory = this.props.templateFileDirectory || templateFileDirectory;
        this.createTemplateModal = null;
        this.templateForm = null;

        this.state = {
            selectedTemplate : this.props.selectedTemplate,
            templates : [ ]
        };
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
            this.setState(nextState);
    }

    updateTemplateList()
    {
        return Api.getTemplates(this.props.customerId)
            .then(templates => this.setState({ templates }));
    }

    handleBack(e)
    {
        e.preventDefault();

        this.props.router.push(this.props.prevViewLink);
    }

    handleSave(e)
    {
        e.preventDefault();

        this.saveTemplateSelection().then(() => this.props.router.push(this.props.nextViewLink));
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
        return this.updateTemplateList();;
    }

    saveTemplateSelection = () =>
    {
        const config = this.props.type === 'email' ?
            { emailTemplate : this.state.selectedTemplate } :
            { landingpageTemplate : this.state.selectedTemplate };

        config.campaignId = this.props.campaignId;

        return request.put('/onboarding/api/campaigns/' + this.props.campaignId)
            .set('Content-Type', 'application/json')
            .send(config)
            .then(() => this.context.showNotification('campaignEditor.template.message.success.saving', 'success'))
            .catch(() => this.context.showNotification('campaignEditor.template.message.error.saving', 'error'));
    }

    render()
    {
        const { templates, selectedTemplate } = this.state;

        return(
            <div className="form-horizontal">
                <h1>Chosse an email template</h1>
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
                                        <input type="radio" name="template" value={template.id} defaultValue={selectedTemplate} onChange={(e) => this.handleChoice(e)} />
                                        {template.name}
                                    </label>
                                </div>
                            );
                        })
                    }
                </div>
                <br/>
                <div className="form-submit text-right">
                    <button className="btn btn-link" onClick={e => this.handleBack(e)}>Previous</button>
                    <button className="btn btn-primary" onClick={e => this.handleCreateTemplate(e)}>Create new template</button>&nbsp;
                    <button className="btn btn-primary" onClick={e => this.handleSave(e)}>Save and proceed</button>
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
