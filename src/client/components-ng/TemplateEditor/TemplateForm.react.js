import React, { Component } from 'react';
import Api from './api';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import Dropzone from 'react-dropzone';
import translations from './i18n';
import { ModalDialog } from '../common';
import TemplatePreview from './TemplatePreview.react';
import validator from 'validate.js';
import extend from 'extend'

const templateFields = {
    en : require(`./data/templateFields.en.json`).sort(item => item.key),
    de : require(`./data/templateFields.de.json`).sort(item => item.key)
};

class TemplateForm extends Component
{
    static propTypes = {
        customerId : React.PropTypes.string.isRequired,
        templateFileDirectory : React.PropTypes.string.isRequired,
        templateId : React.PropTypes.number.isRequired,
        type : React.PropTypes.string.isRequired
    }

    static defaultProps = {
        templateId : 0,
        type : ''
    }

    static contextTypes = {
        showNotification : React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired,
        i18n : React.PropTypes.object.isRequired,
        locale : React.PropTypes.string.isRequired
    }

    static emptyFormItem = {
        id : 0,
        name : '',
        content : '',
        languageId : '',
        countryId : '',
        type : ''
    }

    constructor(props)
    {
        super(props);

        const basicState = {
            templateFileDirectory : this.makePathDirectory(props.templateFileDirectory),
            filesDirectory : '',
            templateId : props.templateId || '',
            type : props.type,
            templates : [ ],
            errors : { }
        }

        this.state = extend(false, { }, TemplateForm.emptyFormItem, basicState);
        this.formChanged = false;
        this.preview = null;

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
        this.loadTemplate(this.state.templateId);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        nextContext.i18n.register('TemplateForm', translations);

        const propsChanged = Object.keys(nextPops).reduce((all, key) => all || nextPops[key] !== this.props[key], false);

        if(propsChanged)
            this.setState(extend(true, this.state, props));
    }

    makePathDirectory(path)
    {
        return this.makePathAbsolute(path.endsWith('/') ? path : path + '/');
    }

    makePathAbsolute(path)
    {
        return path.startsWith('/') ? path : '/' + path;
    }

    getFilesDirectory(templateId)
    {
        templateId = templateId || this.state.id;
        return `${this.state.templateFileDirectory}${templateId}`;
    }

    loadTemplate(templateId)
    {
        this.clearForm();

        templateId = templateId || this.state.templateId;
        const filesDirectory = this.getFilesDirectory();
        this.setState({ filesDirectory, templateId });

        return this.loadTemplates().then(() =>
        {
            if(templateId)
            {
                return Api.getTemplate(this.props.customerId, templateId)
                    .then(item => this.putItemToState(item))
                    .then(() => true)
                    .catch(e => this.context.showNotification(e.message, 'error', 10));
            }

            return Promise.resolve(true);
        });
    }

    loadTemplates()
    {
        return Api.getTemplates(this.props.customerId)
            .then(templates => this.setState({ templates : templates }))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
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

    validateForm(item)
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
            customerId : this.props.customerId,
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

        state.id = parseInt(item.id);
        state.name = item.name;
        state.content = item.content;
        state.languageId  = item.languageId;
        state.countryId = item.countryId;
        state.type = state.type || item.type;

        this.setState(state);
    }

    clearForm()
    {
        $(document).ready(() => $('[href="#TemplateForm_Tab1"]').tab('show'));

        this.putItemToState(TemplateForm.emptyFormItem);
        this.setState({ filesDirectory : null, templateId : '', errors : { } });
        this.formChanged = false;
    }

    getFormGroupClass(fieldName)
    {
        return this.state.errors[fieldName] ? 'form-group has-error' : 'form-group';
    }

    saveForm()
    {
        const i18n = this.context.i18n;
        const item = this.extractItemFromState();
        const errors = this.validateForm(item) || { };
        const hasErrors = errors && Object.keys(errors).length > 0;

        this.setState({ errors : errors });

        if(hasErrors)
        {
            this.context.showNotification(i18n.getMessage('TemplateForm.saveForm.notification.error'), 'error');
            return Promise.resolve(false);
        }
        else
        {
            const currentId = this.state.id;
            const currentTemplateId = this.state.templateId;
            const showSuccess = () => this.context.showNotification(i18n.getMessage('TemplateForm.saveForm.notification.success'), 'success');
            const showError = (e) => this.context.showNotification(e.message, 'error');
            const processResponse = (res) =>
            {
                const filesDirectory = `${this.state.templateFileDirectory}${res.id}`;
                let promise;

                if(currentTemplateId)
                {
                    const templateFilesDirectory = `${this.state.templateFileDirectory}${currentTemplateId}`;
                    promise = Api.copyFilesOfTemplate(this.props.customerId, templateFilesDirectory, filesDirectory);
                }
                else
                {
                    promise = Promise.resolve();
                }

                return promise.then(() =>
                {
                    this.putItemToState(res);
                    this.setState({ filesDirectory : filesDirectory, templateId : '' });
                    this.formChanged = false;

                    return res;
                });
            }

            let promise = currentId ? Api.updateTemplate(this.props.customerId, currentId, item)
                : Api.addTemplate(this.props.customerId, item);

            return promise.then(processResponse).then(showSuccess)
                .delay(500).then(() => this.preview.reload())
                .then(() => true).catch(showError);
        }
    }

    render()
    {
        const errorKeys = this.state.errors && Object.keys(this.state.errors);
        const { i18n, locale } = this.context;

        const overwriteFileModalButtons = { 'yes' : i18n.getMessage('TemplateForm.modal.button.yes'), 'no' : i18n.getMessage('TemplateForm.modal.button.no') };

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
                  <div className={this.getFormGroupClass('template')}>
                      <label htmlFor="template" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.template')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <select className="form-control col-sm-8" id="template" disabled={this.props.templateId} onChange={e => this.applyTemplate(e.target.value)} defaultValue={this.state.templateId}>
                              <option value=""></option>
                              {
                                  this.state.templates && this.state.templates.map(template =>
                                  {
                                      if(template.id != this.state.id && template.type === this.state.type)
                                          return(<option key={template.id} value={template.id}>{template.name}</option>);
                                  })
                              }
                          </select>
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('type')}>
                      <label htmlFor="type" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.type')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <select className="form-control col-sm-8" id="type" disabled={this.state.type} onChange={e => this.handleOnChange(e, 'type')} defaultValue={this.state.type}>
                              <option value=""></option>
                              <option value="email">{i18n.getMessage('TemplateForm.type.email')}</option>
                              <option value="landingpage">{i18n.getMessage('TemplateForm.type.landingpage')}</option>
                          </select>
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('name')}>
                      <label htmlFor="name" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.name')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <input type="text" className="form-control col-sm-8" id="name" value={this.state.name} readOnly={this.state.id} onChange={e => this.handleOnChange(e, 'name')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('content')}>
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
                  <div className={this.getFormGroupClass('language')}>
                      <label htmlFor="language" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.language')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <this.LanguageField key='languages' id="language" optional={true} value={this.state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('country')}>
                      <label htmlFor="country" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.country')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <this.CountryField key='countries' id="country" optional={true} value={this.state.countryId} onChange={e => this.handleOnChange(e, 'countryId')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('preview')}>
                      <label htmlFor="country" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.preview')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          {
                              (this.state.id > 0 &&
                                  <TemplatePreview ref={node => this.preview = node} templateId={this.state.id} customerId={this.props.customerId} />)
                              ||
                                  <p className="lead">{i18n.getMessage('TemplateForm.text.previewNotAvailable')}</p>
                          }
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
                                  templateFields[locale].map(field =>
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

                <Dropzone style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={files => this.uploadTemplate(files.shift())} />

                <ModalDialog
                    title={i18n.getMessage('TemplateForm.modal.overwriteFile.title')}
                    message={i18n.getMessage('TemplateForm.modal.overwriteFile.message')}
                    visible={this.state.showOverwriteTemplateDialog}
                    buttons={overwriteFileModalButtons}
                    onButtonClick={button => this.onOverwriteDialogButtonClick(button)}>
                </ModalDialog>
            </div>
        );
    }
}

export default TemplateForm;
