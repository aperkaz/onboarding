import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import Dropzone from 'react-dropzone';

class FileManager extends Component
{
    static propTypes = {
        tenantId : React.PropTypes.string.isRequired,
        filesDirectory : React.PropTypes.string,
    }

    static defaultProps = {
    }

    static contextTypes = {
        showNotification : React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired,
        showModalDialog : React.PropTypes.func.isRequired,
        hideModalDialog : React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            filesDirectory : '',
            files : [ ]
        }

        this.getFiles().then(files => this.setState({ files : files }))
            .catch(e => this.context.showNotification(e.message, 'error'));
    }

    getFiles()
    {
        return ajax.get(`/blob/api/${this.props.tenantId}/files/${this.props.filesDirectory}`)
            .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
            .then(result =>
            {
                const tree = { };
                const dirs = result.map(item =>
                {
                    let parts = item.location.split('/').slice(1);
                    let parent = tree;
                    let fullPath = '';

                    parts.forEach(part =>
                    {
                        parent[part] = parent[part] || [ ];
                        fullPath += '/' + part;

                        if(fullPath === item.location)
                            parent[part].push(item);

                        parent = parent[part];
                    })
                });

                return tree;
            })
            .catch(result => { throw new Error(result.body.message); });
    }

    renderTree()
    {
        const results = [ ];
        const dir = 'public';
        const files = this.state.files && this.state.files[dir];

        for(let key in files)
        {
            let items = this.state.files[key];
            
            results.push(
                <tr key={key}>
                    <td><input type="checkbox" /></td>
                    <td><span className="glyphicon glyphicon-folder-open"></span></td>
                    <td>{key}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            );

            /*results.push(
                <tr key={item.path}>
                    <td><input type="checkbox" /></td>
                    <td><span className="glyphicon glyphicon-file"></span></td>
                    <td>{item.name}</td>
                    <td>{item.location}</td>
                    <td>{Math.round(item.size / 1024)} KB</td>
                    <td>{item.lastModified}</td>
                </tr>
            );*/
        }

        return results;
    }

    render()
    {
        return(
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>&nbsp;</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Size</th>
                            <th>Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderTree()}
                    </tbody>
                </table>
                <button type="button" className="btn btn-link">Select all</button>
                <button type="button" className="btn btn-link">Deselect all</button>
                <div className="form-submit text-right">
                    <button type="button" className="btn btn-default">Delete</button>
                    <button type="button" className="btn btn-primary">Upload</button>
                </div>
            </div>
        );
    }
}

export default FileManager;
