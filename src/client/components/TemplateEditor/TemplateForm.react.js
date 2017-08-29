import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import FileManager from './FileManager.react';
import Dropzone from 'react-dropzone';
import translations from './i18n';
import ModalDialog from '../common/ModalDialog.react';
import validator from 'validate.js';

const templateFields = require('./templateFields.json').sort(item => item.key);

class TemplateForm extends Component
{
    static propTypes = {
        customerId : React.PropTypes.string.isRequired,
        templateFileDirectory : React.PropTypes.string.isRequired,
        templateId : React.PropTypes.number,
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
            templateFileDirectory : this.makePathDirectory(this.props.templateFileDirectory),
            filesDirectory : '',
            type : this.props.type,
            templateId : this.props.templateId,
            errors : { }
        }

        this.formChanged = false;

        const serviceRegistry = (service) => ({ url: '/isodata' });
        this.LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });
    }

    componentWillMount()
    {
        this.context.i18n.register('TemplateForm', translations);
    }

    componentDidMount()
    {
        this.loadTemplates();

        if(this.state.templateId)
            this.loadTemplate(this.state.templateId);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(this.context != nextContext)
            this.context.i18n.register('TemplateForm', translations);

        /*this.setState({
            customerId : nextPops.customerId,
            tenantId : 'c_' + nextPops.customerId,
            templateFileDirectory : this.makePathDirectory(nextPops.templateFileDirectory),
            templateId : nextPops.templateId ? nextPops.templateId : this.state.templateId,
            type : nextPops.type ? nextPops.type : this.state.type
        });*/
    }

    makePathDirectory(path)
    {
        return this.makePathAbsolute(path.endsWith('/') ? path : path + '/');
    }

    makePathAbsolute(path)
    {
        return path.startsWith('/') ? path : '/' + path;
    }

    loadTemplate(templateId)
    {
        const filesDirectory = `${this.state.templateFileDirectory}${templateId}`;
        this.setState({ filesDirectory :  filesDirectory });

        return ajax.get(`/onboarding/api/templates/${this.props.customerId}/${templateId}`)
            .then(result => result && result.body)
            .then(item => this.putItemToState(item))
            .catch(e => this.context.showNotification(e.body && e.body.message, 'error', 10));
    }

    loadTemplates()
    {
        return ajax.get(`/onboarding/api/templates/${this.props.customerId}`)
            .then(result => result && result.body)
            .then(templates => this.setState({ templates : templates }))
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

    applyTemplate(templateId)
    {
        const copyTemplateContent = () =>
        {
            this.handleOnChange(templateId, 'templateId');
            this.loadTemplate(templateId).then(() => this.setState({ id : null, filesDirectory : null }));
        }

        if(this.state.name || this.state.content)
            this.showOverwriteTemplateDialog(copyTemplateContent, () => null);
        else
            copyTemplateContent();
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
                this.context.showNotification(this.context.i18n.getMessage('TemplateForm.uploadTemplate.notification.success'), 'success');
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
        const i18n = this.context.i18n;

        const validations = {
            type : {
                presence : { message : i18n.getMessage('TemplateForm.validation.type.isRequired') },
            },
            name : {
                presence : { message : i18n.getMessage('TemplateForm.validation.name.isRequired') },
                format : {
                    pattern : /^[a-z0-9-]*$/,
                    message : i18n.getMessage('TemplateForm.validation.name.format')
                }
            },
            content : {
                presence : { message : i18n.getMessage('TemplateForm.validation.content.isRequired') }
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
            type : this.state.type
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
            type : ''
        }

        this.putItemToState(emptyItem);
        this.setState({ filesDirectory : null, templateId : '' });
        this.resetErrors();
        this.loadTemplates();
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
        const i18n = this.context.i18n;
        const item = this.extractItemFromState();
        const errors = this.validateItem(item) || { };
        const hasErrors = errors && Object.keys(errors).length > 0;

        this.setState({ errors : errors });

        if(hasErrors)
        {
            this.context.showNotification(i18n.getMessage('TemplateForm.saveCurrentItem.notification.error'), 'error');
        }
        else
        {
            const currentId = this.state.id;
            const currentTemplateId = this.state.templateId;
            const showSuccess = () => this.context.showNotification(i18n.getMessage('TemplateForm.saveCurrentItem.notification.success'), 'success');
            const showError = (e) => this.context.showNotification(e.body.message || e.body, 'error');
            const processResponse = (res) =>
            {
                const filesDirectory = `${this.state.templateFileDirectory}${res.body.id}`;
                var promise;

                if(currentTemplateId)
                {
                    const templateFilesDirectory = `${this.state.templateFileDirectory}${currentTemplateId}`;

                    promise = ajax.put(`/blob/api/${this.state.tenantId}/copy${templateFilesDirectory}/`)
                        .set('Content-Type', 'application/json')
                        .query({ overwriteExisting : true })
                        .send({ dstPath : filesDirectory + '/' });
                }
                else
                {
                    promise = Promise.resolve();
                }

                return promise.then(() =>
                {
                    this.putItemToState(res.body);
                    this.setState({ filesDirectory : filesDirectory, templateId : '' });
                    this.formChanged = false;

                    return res.body;
                });
            }

            if(currentId)
            {
                ajax.put(`/onboarding/api/templates/${this.props.customerId}/${currentId}`).set('Content-Type', 'application/json').send(item)
                    .then(processResponse).then(item => this.props.onUpdate(item))
                    .then(showSuccess).catch(showError);
            }
            else
            {
                ajax.post(`/onboarding/api/templates/${this.props.customerId}`).set('Content-Type', 'application/json').send(item)
                    .then(processResponse).then(item => this.props.onCreate(item))
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
        const { i18n } = this.context;

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
                    <div className={this.getClassesFor('template')}>
                        <label htmlFor="template" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.template')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <select className="form-control col-sm-8" id="template" disabled={this.props.templateId} onChange={e => this.applyTemplate(e.target.value)} defaultValue={this.state.templateId} value={this.state.templateId}>
                                <option value=""></option>
                                {
                                    this.state.templates && this.state.templates.map(template =>
                                    {
                                        if(template.id != this.state.id)
                                            return(<option key={template.id} value={template.id}>{template.name}</option>);
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div className={this.getClassesFor('type')}>
                        <label htmlFor="type" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.type')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <select className="form-control col-sm-8" id="type" disabled={this.state.type} onChange={e => this.handleOnChange(e, 'type')} defaultValue={this.state.type} value={this.state.type}>
                                <option value=""></option>
                                <option value="email">{i18n.getMessage('TemplateForm.type.email')}</option>
                                <option value="landingpage">{i18n.getMessage('TemplateForm.type.landingpage')}</option>
                            </select>
                        </div>
                    </div>
                    <div className={this.getClassesFor('name')}>
                        <label htmlFor="name" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.name')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <input type="text" className="form-control col-sm-8" id="name" value={this.state.name} readOnly={this.state.id} onChange={e => this.handleOnChange(e, 'name')} />
                        </div>
                    </div>
                    <div className={this.getClassesFor('content')}>
                        <label htmlFor="content" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.content')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <textarea className="form-control" rows="10" id="content" value={this.state.content} onChange={e => this.handleOnChange(e, 'content')}></textarea>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="templateContent" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.uploadFile')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <button type="button" className="btn btn-default" onClick={() => this.dropzone.open()}>{i18n.getMessage('TemplateForm.button.upload')}</button>
                        </div>
                    </div>
                    <div className={this.getClassesFor('language')}>
                        <label htmlFor="language" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.language')}</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.LanguageField key='languages' id="language" optional={true} value={this.state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                        </div>
                    </div>
                    <div className={this.getClassesFor('country')}>
                        <label htmlFor="country" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.country')}</label>
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
                                      <th>{i18n.getMessage('TemplateForm.header.placeholder')}</th>
                                      <th>{i18n.getMessage('TemplateForm.header.description')}</th>
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
                            this.props.allowCancel && <button type="submit" className="btn btn-default" onClick={() => this.cancelCurrentItem()}>{i18n.getMessage('TemplateForm.button.cancel')}</button>
                        }
                        {
                            this.props.allowCreate && !this.state.id
                                && <button type="submit" className="btn btn-primary" onClick={() => this.saveCurrentItem()}>{i18n.getMessage('TemplateForm.button.create')}</button>
                        }
                        {
                            this.props.allowUpdate && this.state.id
                                && <button type="submit" className="btn btn-primary" onClick={() => this.saveCurrentItem()}>{i18n.getMessage('TemplateForm.button.update')}</button>
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
                    title={i18n.getMessage('TemplateForm.modal.overwriteFile.title')}
                    message={i18n.getMessage('TemplateForm.modal.overwriteFile.message')}
                    visible={this.state.showOverwriteTemplateDialog}
                    buttons={[ 'yes', 'no' ]}
                    onButtonClick={button => this.onOverwriteDialogButtonClick(button)}>
                </ModalDialog>
            </div>
        );
    }
}

export default TemplateForm;
