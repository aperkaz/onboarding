import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import FileManager from './FileManager.react';
import Dropzone from 'react-dropzone';
import ModalDialog from '../common/ModalDialog.react';

class TemplateForm extends Component
{
    static propTypes = {
        tenantId : React.PropTypes.string.isRequired,
        template : React.PropTypes.object,
        filesDirectory : React.PropTypes.string,
        onDelete : React.PropTypes.func,
        onCreate : React.PropTypes.func,
        onUpdate : React.PropTypes.func,
        allowDelete : React.PropTypes.bool.isRequired,
        allowCreate : React.PropTypes.bool.isRequired,
        allowUpdate : React.PropTypes.bool.isRequired
    }

    static defaultProps = {
        onCancel : () => { },
        onCreate : () => { },
        onUpdate : () => { },
        allowDelete : true,
        allowCreate : true,
        allowUpdate : true
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

        this.state = { }
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

    handleTemplateNameChange = (e) =>
    {
        this.setState({ name: e.target.value });
    }

    handleTemplateContentChange = (e) =>
    {
        this.setState({ content: e.target.value });
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

    callOnCancel = () =>
    {
        this.props.onCancel();
    }

    callOnCreate = () =>
    {
        this.props.onCreate();
    }

    render()
    {
        return(
            <div>
                <div className="col-md-8 form-horizontal">
                    <div className="form-group">
                        <label htmlFor="templateName" className="col-sm-2 control-label text-left">Template name</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <input type="text" className="form-control col-sm-8" id="templateName" value={this.state.name} onChange={this.handleTemplateNameChange} placeholder="Template name" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="templateContent" className="col-sm-2 control-label text-left">Template content</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <textarea className="form-control" rows="10" id="templateContent" value={this.state.content} onChange={this.handleTemplateContentChange}></textarea>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="templateContent" className="col-sm-2 control-label text-left">Template upload</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <button type="button" className="btn btn-default" onClick={() => this.dropzone.open()}>Upload file</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label text-left">Template language</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.LanguageField key='languages' actionUrl={document.location.origin} value='de' onChange={() => null} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label text-left">Template country</label>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.CountryField key='countries' actionUrl={document.location.origin} value='DEU' onChange={() => null} />
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
                        <button type="submit" className="btn btn-default" onClick={this.callOnCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary" onClick={this.callOnCreate}>Save</button>
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
