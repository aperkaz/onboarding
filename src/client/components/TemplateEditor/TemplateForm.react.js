import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';

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
            <div className="form-horizontal">
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
                <div className="form-submit text-right">
                    <button type="submit" className="btn btn-default" onClick={this.callOnCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" onClick={this.callOnCreate}>Save</button>
                </div>
            </div>
        );
    }
}

export default TemplateForm;
