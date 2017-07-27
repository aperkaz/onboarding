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
        showNotification: React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired
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
            .then(result => result.body)
            .catch(result => { throw new Error(result.body.message); });
    }

    render()
    {
        return(
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.files.map(item =>
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
        );
    }
}

export default FileManager;
