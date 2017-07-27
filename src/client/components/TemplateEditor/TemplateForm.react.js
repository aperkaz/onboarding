import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import Dropzone from 'react-dropzone';

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
        showNotification: React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired
    }

    templateVariables = [{
        name : 'customer.firstName',
        description : 'Customer first name'
    }, {
        name : 'customer.lastName',
        description : 'Customer last name'
    }]

    constructor(props)
    {
        super(props);

        this.state = {
            name : '',
            content : '',
            language : 'de',
            country: 'DE'
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

    uploadTemplaze(content)
    {
        return ajax.put(`/api/${this.props.tenantId}/files/${this.props.template.path}`)
            .set('Content-Type', 'application/octet-stream')
            .send(content)
            .promise();
    }

    handleValueChange = (name, e) =>
    {
        this.setState({ [name]: e.target.value });
    }

    handleUploadTemplate = (files) =>
    {
        const file = files.shift();
        const reader = new FileReader();


        reader.onload = e =>
        {
            let content = new TextDecoder('utf-8').decode(e.target.result);
            this.setState({ content : content });
        }
        //reader.onerror = e => reject('Error reading ' + file.name + ': ' + e.target.result);
        reader.readAsArrayBuffer(file);
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
                        <div className="col-sm-2 text-right">
                            <label>Template name</label>
                        </div>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <input type="text" className="form-control col-sm-8" id="templateName" value={this.state.name} onChange={e => this.handleValueChange('name', e)} placeholder="Template name" />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-2 text-right">
                            <label>Content</label>
                        </div>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <textarea className="form-control" rows="10" id="templateContent" value={this.state.content} onChange={e => this.handleValueChange('content', e)}></textarea>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-2 text-right">
                            <label>Language</label>
                        </div>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.LanguageField key='languages' actionUrl={document.location.origin} value={this.state.language} onChange={e => this.handleValueChange('language', e)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-2 text-right">
                            <label>Country</label>
                        </div>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <this.CountryField key='countries' actionUrl={document.location.origin} value={this.state.country} onChange={e => this.handleValueChange('country', e)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-2 text-right">
                            <label>File</label>
                        </div>
                        <div className="col-sm-1 text-right"></div>
                        <div className="col-sm-9">
                            <Dropzone accept="text/html" style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={this.handleUploadTemplate} />
                            <button type="button" onClick={() => this.dropzone.open()}>Upload template file</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    {/*<h5>Tempate variables</h5>*/}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.templateVariables.map(item =>
                                {
                                    return(
                                        <tr key={item.name}>
                                            <td>{'{{' + item.name + '}}'}</td>
                                            <td>{item.description}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div className="col-md-12">
                    <div className="form-submit text-right">
                        <button type="submit" className="btn btn-default" onClick={this.callOnCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary" onClick={this.callOnCreate}>Save</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default TemplateForm;
