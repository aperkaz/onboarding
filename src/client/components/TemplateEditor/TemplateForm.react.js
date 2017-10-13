import React from 'react';
import PropTypes from 'prop-types';
import Api from './api';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import Dropzone from 'react-dropzone';
import translations from './i18n';
import { ContextComponent, ModalDialog } from '../common';
import TemplatePreview from './TemplatePreview.react';
import ClipboardButton from 'react-clipboard.js';
import validator from 'validate.js';
import extend from 'extend'

const templateFields = {
    en : require(`./data/templateFields.en.json`),
    de : require(`./data/templateFields.de.json`)
};

class TemplateForm extends ContextComponent
{
    static propTypes = {
        customerId : PropTypes.string.isRequired,
        templateFileDirectory : PropTypes.string.isRequired,
        templateId : PropTypes.number.isRequired,
        type : PropTypes.string.isRequired,
        allowCopy : PropTypes.bool.isRequired,
    }

    static defaultProps = {
        templateId : 0,
        type : '',
        allowCopy : true
    }

    static contextTypes = {
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired
    }

    static emptyFormItem = {
        id : 0,
        name : '',
        content : '',
        languageId : '',
        countryId : '',
        type : ''
    }

    constructor(props, context)
    {
        super(props);

        context.i18n.register('TemplateForm', translations);

        const basicState = {
            templateFileDirectory : this.makePathDirectory(props.templateFileDirectory),
            filesDirectory : '',
            templateId : props.templateId || '',
            propsType : props.type,
            type : props.type,
            templates : [ ],
            files : [ ],
            errors : { }
        }

        this.state = extend(false, { }, TemplateForm.emptyFormItem, basicState);
        this.formChanged = false;
        this.preview = null;

        const serviceRegistry = (service) => ({ url: '/isodata' });
        this.LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });
    }

    componentDidMount()
    {
        this.reload();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        const propsChanged = Object.keys(nextPops).reduce((all, key) => all || nextPops[key] !== this.props[key], false);

        if(propsChanged)
            this.setState(extend(true, { propsType : nextPops.type }, this.state, props));
    }

    reload()
    {
        return this.loadTemplate();
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
        templateId = templateId || this.state.id;

        if(templateId)
        {
            const filesDirectory = this.getFilesDirectory();
            this.setState({ filesDirectory, templateId });

            return this.loadTemplates().then(() => this.loadFiles()).then(() =>
            {
                return Api.getTemplate(this.props.customerId, templateId)
                    .then(item => this.putItemToState(item))
                    .then(() => true)
                    .catch(e => this.context.showNotification(e.message, 'error', 10));

                return Promise.resolve(true);
            });
        }
        else
        {
            this.clearForm();
            return this.loadTemplates().then(() => false);
        }
    }

    loadTemplates()
    {
        return Api.getTemplates(this.props.customerId)
            .then(templates => this.setState({ templates }))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    loadFiles()
    {
        if(this.state.id)
        {
            const filesDirectory = this.getFilesDirectory(this.state.id);

            return Api.getFiles(this.props.customerId, filesDirectory)
                .then(files => this.setState({ files }))
                .catch(e => this.context.showNotification(e.message, 'error', 10));
        }

        return Promise.resolve(false);
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
        state.type = state.propsType || item.type;

        this.setState(state);
    }

    clearForm()
    {
        $(document).ready(() => $('[href="#TemplateForm_Tab1"]').tab('show'));

        this.putItemToState(TemplateForm.emptyFormItem);
        this.setState({ filesDirectory : null, templateId : '', files : [ ], errors : { } });
        this.formChanged = false;
    }

    isNew()
    {
        return this.state.id > 0;
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
        const state = this.state;
        const { i18n, locale } = this.context;
        const blobBasePath = `${document.location.origin}/blob/public/api/c_${this.props.customerId}/files`;

        const overwriteFileModalButtons = { 'yes' : i18n.getMessage('System.yes'), 'no' : i18n.getMessage('System.no') };

        return(
            <div>
                <div className="col-md-8 form-horizontal">
                  {
                      errorKeys && errorKeys.length > 0 &&
                      <div className="alert alert-danger">
                          <ul>
                              {errorKeys.map(fieldName => state.errors[fieldName].map(message => <li>{message}</li>))}
                          </ul>
                      </div>
                  }
                  <div className={this.getFormGroupClass('type')}>
                      <label htmlFor="type" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.type')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <select className="form-control col-sm-8" id="type" disabled={state.type && state.type.length} onChange={e => this.handleOnChange(e, 'type')} defaultValue={state.type}>
                              <option value=""></option>
                              <option value="email">{i18n.getMessage('TemplateForm.type.email')}</option>
                              <option value="landingpage">{i18n.getMessage('TemplateForm.type.landingpage')}</option>
                          </select>
                      </div>
                  </div>
                  {
                      this.props.allowCopy &&
                      <div className={this.getFormGroupClass('template')}>
                          <label htmlFor="template" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.template')}</label>
                          <div className="col-sm-1 text-right"></div>
                          <div className="col-sm-9">
                              <select className="form-control col-sm-8" id="template" disabled={this.props.templateId} onChange={e => this.applyTemplate(e.target.value)} defaultValue={state.templateId}>
                                  <option value=""></option>
                                  {
                                      state.templates && state.templates.map(template =>
                                      {
                                          if(template.id != state.id && template.type === state.type)
                                              return(<option key={template.id} value={template.id}>{template.name} ({template.languageId || '-'})</option>);
                                      })
                                  }
                              </select>
                          </div>
                      </div>
                  }
                  <div className={this.getFormGroupClass('name')}>
                      <label htmlFor="name" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.name')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <input type="text" className="form-control col-sm-8" id="name" value={state.name} readOnly={state.id} onChange={e => this.handleOnChange(e, 'name')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('content')}>
                      <label htmlFor="content" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.content')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <textarea className="form-control" rows="10" id="content" value={state.content} onChange={e => this.handleOnChange(e, 'content')}></textarea>
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
                          <this.LanguageField key='languages' id="language" optional={true} value={state.languageId} onChange={e => this.handleOnChange(e, 'languageId')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('country')}>
                      <label htmlFor="country" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.country')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          <this.CountryField key='countries' id="country" optional={true} value={state.countryId} onChange={e => this.handleOnChange(e, 'countryId')} />
                      </div>
                  </div>
                  <div className={this.getFormGroupClass('preview')}>
                      <label htmlFor="country" className="col-sm-2 control-label text-left">{i18n.getMessage('TemplateForm.label.preview')}</label>
                      <div className="col-sm-1 text-right"></div>
                      <div className="col-sm-9">
                          {
                              (state.id > 0 &&
                                  <TemplatePreview
                                      ref={node => this.preview = node}
                                      templateId={state.id}
                                      customerId={this.props.customerId}
                                      allowCopy={false}
                                      allowEdit={false} />)
                              ||
                                  <p className="lead">{i18n.getMessage('TemplateForm.text.previewNotAvailable')}</p>
                          }
                      </div>
                  </div>
                </div>
                <div className="col-md-4">
                    <h4>{i18n.getMessage('TemplateForm.header.placeholder')}</h4>
                </div>
                <div className="col-md-4" style={{ maxHeight : '450px', overflow : 'scroll', wordWrap : 'break-word' }}>
                    <ul className="list-group">
                        {
                            templateFields[locale].map(field =>
                            {
                                return(<li key={field.key} className="list-group-item"><strong>{'{{'+ field.key +'}}'}</strong><br /><span>{field.description}</span></li>)
                            })
                        }
                    </ul>
                </div>
                <div className="col-md-4">
                    <h4>{i18n.getMessage('TemplateForm.header.files')}</h4>
                </div>
                <div className="col-md-4" style={{ maxHeight : '300px', overflow : 'scroll', wordWrap : 'break-word' }}>
                    <ul className="list-group">
                        {
                            state.files.length && state.files.map((file, index) =>
                            {
                                return(
                                    <li key={file.path} className="list-group-item">
                                        <div className="row">
                                            <div className="col-xs-3">
                                                <img src={`${blobBasePath}${file.path}?inline=true`} className="img-thumbnail" />
                                            </div>
                                            <div className="col-xs-9">
                                                <span className="input-group">
                                                    <input type="text" className="form-control" id={`file_${index}`} readOnly={true} defaultValue={`${blobBasePath}${file.path}`} />
                                                    <span className="input-group-btn">
                                                        <ClipboardButton className="btn btn-default" data-clipboard-target={`#file_${index}`}>
                                                            <i className="fa fa-clipboard" aria-hidden="true"></i>
                                                        </ClipboardButton>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                            || <div><hr /><p className="lead">{i18n.getMessage('TemplateForm.text.noFilesAvailable')}</p></div>
                        }
                    </ul>
                </div>

                <Dropzone style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={files => this.uploadTemplate(files.shift())} />

                <ModalDialog
                    title={i18n.getMessage('TemplateForm.modal.overwriteFile.title')}
                    message={i18n.getMessage('TemplateForm.modal.overwriteFile.message')}
                    visible={state.showOverwriteTemplateDialog}
                    buttons={overwriteFileModalButtons}
                    onButtonClick={button => this.onOverwriteDialogButtonClick(button)}>
                </ModalDialog>
            </div>
        );
    }
}

export default TemplateForm;
