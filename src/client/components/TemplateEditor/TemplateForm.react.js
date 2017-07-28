import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import FileManager from './FileManager.react';
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

    showFileSelector()
    {
        this.setState({ showFileSelector : true });
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
                            <textarea className="form-control" rows="10" id="templateContent" onChange={this.handleTemplateContentChange}>{this.state.content}</textarea>
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
                        </div>
                        <div className="col-sm-2">
                            <button className="btn btn-default pull-left" onClick={() => this.showFileSelector()}><span className="glyphicon glyphicon-folder-open"></span></button>
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
                <ModalDialog title="Choose a file" visible={this.state.showFileSelector}>
                    <FileManager
                        tenantId="c_ncc"
                        selectorVersion={true}
                        filesDirectory="/public/onboarding/eInvoiceSupplierOnboarding/onboardingTemplates/generic"
                        onFileSelection={item => this.setState({ logoFile : item.path })}>
                    </FileManager>
                </ModalDialog>
            </div>
        );
    }
}

export default TemplateForm;
