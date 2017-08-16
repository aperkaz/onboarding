import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import FileManager from './FileManager.react';
import Dropzone from 'react-dropzone';
import ModalDialog from '../common/ModalDialog.react';
import validator from 'validate.js';

const templateFields = require('./templateFields.json').sort(item => item.key);

class TemplateForm extends Component
{
    static propTypes = {
        customerId : React.PropTypes.string.isRequired,
        type : React.PropTypes.string,
        onCreate : React.PropTypes.func,
        onUpdate : React.PropTypes.func,
        onCancel : React.PropTypes.func,
        allowCreate : React.PropTypes.bool.isRequired,
        allowUpdate : React.PropTypes.bool.isRequired,
        allowCancel : React.PropTypes.bool.isRequired
    }

    static defaultProps = {
        onCreate : () => { },
        onUpdate : () => { },
        onCancel : () => { },
        allowCreate : true,
        allowUpdate : true,
        allowCancel : true
    }

    static contextTypes = {
        showNotification : React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired,
        i18n : React.PropTypes.object.isRequired,
    }

    constructor(props)
    {
        super(props);

        this.state = {
            id : null,
            customerId : this.props.customerId,
            tenantId : 'c_' + this.props.customerId,
            filesDirectory : this.props.filesDirectory,
            type : this.props.type,
            errors : { }
        }

        this.formChanged = false;
        this.clearForm();

        const serviceRegistry = (service) => ({ url: '/isodata' });
        this.LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });
    }

    loadTemplate(templateId)
    {
        const filesDirectory = `/public/${this.state.tenantId}/onboarding/campaigns/eInvoiceSupplierOnboarding/${templateId}`;
        this.setState({ filesDirectory :  filesDirectory });

        return ajax.get(`/onboarding/api/templates/${this.props.customerId}/${templateId}`)
            .then(result => result && result.body)
            .then(item => this.putItemToState(item))
            .catch(e => this.context.showNotification(e.body && e.body.message, 'error', 10));
    }

    handleOnChange(e, fieldName)
    {
        this.formChanged = true;

        if(typeof e === 'object')
            this.setState({ [fieldName]: e.target.value });
        else
            this.setState({ [fieldName]: e });
    }

    handleFileSelection(forField, value)
    {
        this.setState({ [forField] : value });
        this.hideFileSelector();
    }

    uploadTemplate(file)
    {
        const showPreview = () =>
        {
            const reader = new FileReader();

            reader.onload = (e) =>
            {
                this.context.showNotification('File uploaded.', 'success');
                this.setState({ content : e.target.result });
            }

            reader.readAsText(file);
        }

        if(this.state.content)
            this.showOverwriteTemplateDialog(showPreview, () => null);
        else
            showPreview();
    }

    showOverwriteTemplateDialog(onConfirm, onCancel)
    {
        this.setState({
            showOverwriteTemplateDialog : true,
            overwriteOnConfirm : onConfirm,
            overwriteOnCancel : onCancel
        });
    }

    hideOverwriteTemplateDialog()
    {
        this.setState({ showOverwriteTemplateDialog : false });
    }

    onOverwriteDialogButtonClick(button)
    {
        this.hideOverwriteTemplateDialog();

        if(button === 'yes')
            this.state.overwriteOnConfirm();
        else if(button === 'no')
            this.state.overwriteOnCancel();
    }

    validateItem(item)
    {
        const validations = {
            type : {
                presence : { message : 'Please select a value for "Template type".' },
            },
            name : {
                presence : { message : 'The field "Template name" can not be empty.' },
                format : {
                    pattern : /^[a-z0-9-]*$/,
                    message : 'The field "Template name" can only consist of lower case letters (a-z), digits (0-9) and hyphens (-).'
                }
            },
            content : {
                presence : { message : 'The field "Template content" can not be empty.' }
            }
        }

        return validator(item, validations, { fullMessages : false });
    }

    extractItemFromState()
    {
        return {
            id : this.state.id,
            customerId : this.state.customerId,
            name : this.state.name,
            content : this.state.content,
            languageId : this.state.languageId,
            countryId : this.state.countryId,
            type : this.state.type,
            files : {
                logo : this.state.logoFile,
                header : this.state.headerFile
            }
        }
    }

    putItemToState(item)
    {
        const state = this.state;

        state.id = item.id;
        state.name = item.name;
        state.content = item.content;
        state.languageId  = item.languageId;
        state.countryId = item.countryId;
        state.type = item.type;
        state.logoFile = item.files && item.files.logo;
        state.headerFile = item.files && item.files.header;

        this.setState(state);
    }

    resetErrors()
    {
        this.setState({ errors : { } });
    }

    clearForm()
    {
        const emptyItem = {
            id : '',
            name : '',
            content : '',
            languageId : '',
            countryId : '',
            type : '',
            files : { logo : '', header : '' }
        }

        this.putItemToState(emptyItem);
        this.setState({ filesDirectory : null });
        this.resetErrors();
        this.formChanged = false;
    }

    takeClasses(classes)
    {
        const result = [ ];

        for(var key in classes)
            classes[key] && result.push(key);

        return result;
    }

    getClassesFor(fieldName)
    {
        return this.takeClasses({
            'form-group' : true,
            'has-error' : this.state.errors[fieldName]
        })
        .join(' ');
    }

    saveCurrentItem()
    {
        const item = this.extractItemFromState();
        const errors = this.validateItem(item) || { };
        const hasErrors = errors && Object.keys(errors).length > 0;

        this.setState({ errors : errors });

        if(hasErrors)
        {
            this.context.showNotification('A validation error occured. For details please pay attention to the form.', 'error');
        }
        else
        {
            const currentId = this.state.id;
            const showSuccess = () => this.context.showNotification('Template successfully saved.', 'success');
            const showError = (e) => this.context.showNotification(e.body.message || e.body, 'error');

            if(currentId)
            {
                ajax.put(`/onboarding/api/templates/${this.props.customerId}/${currentId}`).set('Content-Type', 'application/json').send(item)
                .then(res =>
                {
                    this.putItemToState(res.body);
                    return this.props.onUpdate(res.body);
                })
                .then(() => this.formChanged = false)
                .then(showSuccess).catch(showError);
            }
            else
            {
                ajax.post(`/onboarding/api/templates/${this.props.customerId}`).set('Content-Type', 'application/json').send(item)
                .then(res =>
                {
                    const templateId = res.body.id;
                    const filesDirectory = `/public/${this.state.tenantId}/onboarding/campaigns/eInvoiceSupplierOnboarding/${templateId}`;

                    this.putItemToState(res.body);
                    this.setState({ filesDirectory : filesDirectory });

                    return this.props.onCreate(res.body);
                })
                .then(() => this.formChanged = false)
                .then(showSuccess).catch(showError);
            }
        }
    }

    cancelCurrentItem()
    {
        const item = this.extractItemFromState();
        this.clearForm();

        return this.props.onCancel(item);
    }

    render()
    {
        const errorKeys = this.state.errors && Object.keys(this.state.errors);

        return(
            <div>
                <div className="col-md-8 form-horizontal">
                    {
                        errorKeys && errorKeys.length > 0 &&
                        <div className="alert alert-danger">
                            <ul>
                                {errorKeys.map(fieldName => this.state.errors[fieldName].map(message => <li>{message}</li>))}
                            </ul>
                        </div>
                    }
                    <div className={this.getClassesFor('type')}>
                        <label htmlFor="type" className="col-sm-2 control-label text-left">Template type</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <select className="form-control col-sm-8" id="type" readOnly={this.state.type} onChange={e => this.handleOnChange(e, 'type')} placeholder="Template type">
                                <option value="" selected={!this.state.type}></option>
                                <option value="email" selected={this.state.type === 'email'}>Email</option>
                                <option value="landingpage" selected={this.state.type === 'landingpage'}>Landingpage</option>
                            </select>
                        </div>
                    </div>
                    <div className={this.getClassesFor('name')}>
                        <label htmlFor="name" className="col-sm-2 control-label text-left">Template name</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <input type="text" className="form-control col-sm-8" id="name" value={this.state.name} readOnly={this.state.id} onChange={e => this.handleOnChange(e, 'name')} placeholder="Template name" />
                        </div>
                    </div>
                    <div className={this.getClassesFor('content')}>
                        <label htmlFor="content" className="col-sm-2 control-label text-left">Template content</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <textarea className="form-control" rows="10" id="content" value={this.state.content} onChange={e => this.handleOnChange(e, 'content')}></textarea>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="templateContent" className="col-sm-2 control-label text-left">Template upload</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <button type="button" className="btn btn-default" onClick={() => this.dropzone.open()}>Upload file</button>
                        </div>
                    </div>
                    <div className={this.getClassesFor('language')}>
                        <label htmlFor="language" className="col-sm-2 control-label text-left">Template language</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.LanguageField key='languages' id="language" optional={true} value={this.state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                        </div>
                    </div>
                    <div className={this.getClassesFor('country')}>
                        <label htmlFor="country" className="col-sm-2 control-label text-left">Template country</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.CountryField key='countries' id="country" optional={true} value={this.state.countryId} onChange={e => this.handleOnChange(e, 'countryId')} />
                        </div>
                    </div>
                </div>
                <div className="col-md-4" style={{ maxHeight : 460, overflow : 'scroll', border: 'solid 1px #aaa' }}>
                    <table className="table" style={{ maxWidth : '100%', tableLayout : 'fixed', wordWrap : 'break-word' }}>
                          <thead>
                                <tr>
                                      <th>Placeholder</th>
                                      <th>Description</th>
                                </tr>
                          </thead>
                          <tbody>
                                {
                                    templateFields.map(field =>
                                    {
                                        return(
                                            <tr key={field.key}>
                                                  <td>{'{{'+ field.key +'}}'}</td>
                                                  <td>{field.description}</td>
                                            </tr>
                                        )
                                    })
                                }
                          </tbody>
                    </table>
                </div>

                <div className="col-md-12">
                    <div className="form-submit text-right">
                        {
                            this.props.allowCancel && <button type="submit" className="btn btn-default" onClick={() => this.cancelCurrentItem()}>Cancel</button>
                        }
                        {
                            this.props.allowCreate && !this.state.id
                                && <button type="submit" className="btn btn-primary" onClick={() => this.saveCurrentItem()}>Create</button>
                        }
                        {
                            this.props.allowUpdate && this.state.id
                                && <button type="submit" className="btn btn-primary" onClick={() => this.saveCurrentItem()}>Update</button>
                        }
                    </div>
                </div>
                <div className="col-md-12">
                    &nbsp;
                </div>
                {
                    this.state.filesDirectory &&
                        <div className="col-md-12">
                            <FileManager
                                tenantId={this.state.tenantId}
                                filesDirectory={this.state.filesDirectory}>
                            </FileManager>
                        </div>
                }

                <Dropzone style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={files => this.uploadTemplate(files.shift())} />
                <ModalDialog
                    title="Overwrite template file"
                    message="Do you really want to overwrite the existing template content?"
                    visible={this.state.showOverwriteTemplateDialog}
                    buttons={[ 'yes', 'no' ]}
                    onButtonClick={button => this.onOverwriteDialogButtonClick(button)}>
                </ModalDialog>
            </div>
        );
    }
}

export default TemplateForm;
