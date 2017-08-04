import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import FileManager from './FileManager.react';
import Dropzone from 'react-dropzone';
import ModalDialog from '../common/ModalDialog.react';
import validator from 'validate.js';

class TemplateForm extends Component
{
    static propTypes = {
        tenantId : React.PropTypes.string.isRequired,
        template : React.PropTypes.object,
        filesDirectory : React.PropTypes.string,
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
        hideNotification : React.PropTypes.func.isRequired
    }

    templateFields = [{
        key : 'contact.firstName',
        description : 'Contact first name.'
    }, {
        key : 'contact.lastName',
        description : 'Contact last name.'
    }]
    .sort(item => item.key);

    constructor(props)
    {
        super(props);

        this.state = {
            id : null,
            name : '',
            content : '',
            language : '',
            country : '',
            logoFile : '',
            headerFile : '',
            isNew : true,
            errors : { }
        }
    }

    componentWillMount()
    {
        const serviceRegistry = (service) => ({ url: '/isodata' });
        this.LanguageField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-languages', jsFileName: 'languages-bundle' });
        this.CountryField = serviceComponent({ serviceRegistry, serviceName: 'isodata' , moduleName: 'isodata-countries', jsFileName: 'countries-bundle' });
    }

    loadFiles()
    {
        return ajax.get(`/blob/api/${this.props.tenantId}/files/${this.props.filesDirectory}`)
            .then(response => JSON.parse(response.text));
    }

    loadTemplate()
    {
        return ajax.get(`/blob/api/${this.props.tenantId}/files/${this.props.template.path}`)
            .then(response => response.text);
    }

    handleOnChange(e, fieldName)
    {
        this.setState({ [fieldName]: e.target.value });
    }

    showFileSelector(forField)
    {
        this.setState({ showFileSelector : forField });
    }

    hideFileSelector()
    {
        this.setState({ showFileSelector : false });
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
        validations = {
            name : {
                presence : true,
                format : {
                    pattern: /[a-z0-9-]/
                }
            }
        }

        return validator(item, validations, { fullMessages : false });
    }

    extractItemFromState()
    {
        return {
            id : this.state.id,
            name : this.state.name,
            content : this.state.content,
            language : this.state.language,
            country : this.state.country,
            logoFile : this.state.logoFile,
            headerFile : this.state.headerFile,
            isNew : this.state.isNew
        }
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
        });
    }

    callOnCreate()
    {
        const item = this.extractItemFromState();
        const errors = this.validateItem(item);
    }

    callOnUpdate()
    {
        this.props.onUpdate();
    }

    callOnCancel()
    {
        this.props.onUpdate();
    }

    render()
    {
        return(
            <div>
                <div className="col-md-8 form-horizontal">
                    <div className={this.getClassesFor('name')}>
                        <label htmlFor="name" className="col-sm-2 control-label text-left">Template name</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <input type="text" className="form-control col-sm-8" id="name" value={this.state.name} readOnly={!this.state.isNew} onChange={e => this.handleOnChange(e, 'name')} placeholder="Template name" />
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
                            <this.LanguageField key='languages' id="language" actionUrl={document.location.origin} value={this.state.language} onChange={e => this.handleOnChange(e, 'language')} />
                        </div>
                    </div>
                    <div className={this.getClassesFor('country')}>
                        <label htmlFor="country" className="col-sm-2 control-label text-left">Template country</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.CountryField key='countries' id="country" actionUrl={document.location.origin} value={this.state.country} onChange={e => this.handleOnChange(e, 'country')} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label text-left">Logo file</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-7">
                            <input type="text" className="form-control col-sm-8" readOnly={true} value={this.state.logoFile} placeholder="Logo file" />
                            {
                                this.state.logoFile && <img src={`/blob/public/api/${this.props.tenantId}/files${this.state.logoFile}`} style={{ maxWidth : 150, maxHeight : 113, marginTop : 10 }} />
                            }
                        </div>
                        <div className="col-sm-2">
                            <button className="btn btn-default pull-left" onClick={() => this.showFileSelector('logoFile')}><span className="glyphicon glyphicon-folder-open"></span></button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label text-left">Header file</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-7">
                            <input type="text" className="form-control col-sm-8" readOnly={true} value={this.state.headerFile} placeholder="Header file" />
                            {
                                this.state.headerFile && <img src={`/blob/public/api/${this.props.tenantId}/files${this.state.headerFile}`} style={{ maxWidth : 150, maxHeight : 113, marginTop : 10 }} />
                            }
                        </div>
                        <div className="col-sm-2">
                            <button className="btn btn-default pull-left" onClick={() => this.showFileSelector('headerFile')}><span className="glyphicon glyphicon-folder-open"></span></button>
                        </div>
                    </div>
                    <div className="form-submit text-right">
                        {
                            this.props.allowCancel && <button type="submit" className="btn btn-default" onClick={() => this.callOnCancel()}>Cancel</button>
                        }
                        {
                            this.props.allowCreate && this.state.isNew
                                && <button type="submit" className="btn btn-primary" onClick={() => this.callOnCreate()}>Create</button>
                        }
                        {
                            this.props.allowUpdate && !this.state.isNew
                                && <button type="submit" className="btn btn-primary" onClick={() => this.callOnUpdate()}>Update</button>
                        }
                    </div>
                </div>
                <div className="col-md-4">
                    <table className="table">
                          <thead>
                                <tr>
                                      <th>Placeholder</th>
                                      <th>Description</th>
                                </tr>
                          </thead>
                          <tbody>
                                {
                                    this.templateFields.map(field =>
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
                    title="Choose a file"
                    visible={this.state.showFileSelector}
                    buttons={[ 'close' ]}
                    onButtonClick={() => this.hideFileSelector()}>
                    <FileManager
                        tenantId={this.props.tenantId}
                        selectorVersion={true}
                        filesDirectory={this.props.filesDirectory}
                        onFileSelection={item => this.handleFileSelection(this.state.showFileSelector, item.path)}>
                    </FileManager>
                </ModalDialog>
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
