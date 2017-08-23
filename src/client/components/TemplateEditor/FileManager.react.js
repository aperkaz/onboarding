import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import { Tooltip } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Promise from 'bluebird';

class FileManager extends Component
{
    static propTypes = {
        tenantId : React.PropTypes.string.isRequired,
        filesDirectory : React.PropTypes.string,
        selectorVersion : React.PropTypes.bool,
        allowCreate : React.PropTypes.bool.isRequired,
        allowDelete : React.PropTypes.bool.isRequired,
        onFileSelection : React.PropTypes.func.isRequired,
        onCreate : React.PropTypes.func,
        onDelete : React.PropTypes.func
    }

    static defaultProps = {
        selectorVersion : false,
        allowCreate : true,
        allowDelete : true,
        onFileSelection : () => { },
        onCreate : () => { },
        onDelete : () => { }
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
            tenantId : this.props.tenantId,
            filesDirectory : this.props.filesDirectory,
            files : [ ],
            checkedItems : { }
        }

        this.tableEntries = { };
        this.checkboxes = { };
    }

    componentDidMount()
    {
        this.updateFileList();
    }

    componentWillReceiveProps(nextPops)
    {
        this.setState({
            tenantId : nextPops.tenantId,
            filesDirectory : nextPops.filesDirectory
        });
    }

    getFiles()
    {
        let path = this.state.filesDirectory;

        if(path)
        {
            if(!path.startsWith('/'))
                path = '/' + dir;
            if(!path.endsWith('/'))
                path += '/';

            return ajax.get(`/blob/api/${this.state.tenantId}/files${path}`)
                .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
                .catch(result => { throw new Error(result.body.message || result.body); });
        }

        return Promise.resolve();
    }

    updateFileList()
    {
        const notification = this.context.showNotification('Loading file list...', 'info');

        return this.getFiles().then(files => this.setState({ files : files }))
            .then(() => this.context.hideNotification(notification))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    deleteSingleItem(item)
    {
        const title = 'Remove file';
        const message = `Do you really want to remove the file "${item.name}"?`;
        const buttons = [ 'yes', 'no' ];
        const hideDialog = () => { this.context.hideModalDialog(); }
        const onButtonClick = (button) =>
        {
            this.context.hideModalDialog();

            if(button === 'yes')
            {
                const path = this.state.filesDirectory + '/' + item.name;

                return ajax.delete(`/blob/api/${this.state.tenantId}/files${path}`)
                    .then(() => this.updateFileList())
                    .then(() => this.context.showNotification(`File "${item.name}" successfully removed.`, 'success'))
                    .then(() => this.props.onDelete(item))
                    .catch(e => this.context.showNotification(e.body.message || e.body, 'error', 10));
            }
        }

        this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
    }

    deleteMultipleItems(items)
    {
        if(items && items.length)
        {
            const title = 'Remove files';
            const message = `Do you really want to remove ${items.length} files?`;
            const buttons = [ 'yes', 'no' ];
            const hideDialog = () => { this.context.hideModalDialog(); }
            const onButtonClick = (button) =>
            {
                this.context.hideModalDialog();

                if(button === 'yes')
                {
                    const all = items && items.map(item =>
                    {
                        const path = this.state.filesDirectory + '/' + item.name;

                        return ajax.delete(`/blob/api/${this.state.tenantId}/files${path}`)
                            .then(() => this.props.onDelete(item))
                            .catch(result => { throw new Error(result.body.message || result.body); });
                    });

                    return Promise.all(all)
                        .then(() => this.context.showNotification(`${items.length} files have been successfully removed.`, 'success'))
                        .catch(e => this.context.showNotification(e.message, 'error', 10))
                        .finally(() => this.updateFileList());
                }
            }

            this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
        }
    }

    setItemSelection(item, selected)
    {
        if(Array.isArray(item))
            return item.forEach(i => this.setItemSelection(i, selected));

        this.selectedFiles = this.selectedFiles || { };
        this.checkboxes[item.path].checked = selected;

        if(selected)
            this.selectedFiles[item.path] = item;
        else
            delete this.selectedFiles[item.path];
    }

    uploadFiles(file)
    {
        if(Array.isArray(file))
            return Promise.all(file && file.map(f => this.uploadFiles(f)));

        const filename = file.name.replace('\/', '-');
        const path = this.state.filesDirectory + '/' + filename;
        const notification = this.context.showNotification(`Uploading file "${filename}..."`, 'info', 20);
        const formData = new FormData();

        formData.append('file', file);
        formData.append('name', filename);

        return ajax.put(`/blob/api/${this.state.tenantId}/files${path}`)
            .query({ createMissing: true })
            .send(formData)
            .then(result => result.body)
            .then(item =>
            {
                return this.updateFileList().then(() =>
                {
                    $(this.tableEntries[item.path]).children().addClass('success');
                    setTimeout(() => $(this.tableEntries[item.path]).children().removeClass('success'), 4000);
                });
            })
            .then(() => this.props.onCreate(filename))
            .then(() => this.context.showNotification('File successfully uploaded.', 'success'))
            .catch(e => this.context.showNotification(e.body.message || e.body, 'error', 10))
            .finally(() => this.context.hideNotification(notification));
    }

    render()
    {
        this.selectedFiles = { };
        this.checkboxes = { };

        if(this.props.selectorVersion)
        {
            return(
                <div className="list-group">
                    {
                        this.state.files && this.state.files.map(item => (
                            <a href="#" key={item.path} className="list-group-item" onClick={(e) => { this.props.onFileSelection(item); e.preventDefault(); }}>
                                <span className="glyphicon glyphicon-file"></span>&nbsp;
                                {item.name} ({Math.round(item.size / 1024)} KB)
                            </a>
                        ))
                    }
                </div>
            );
        }
        else
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
                                <th>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.files && this.state.files.map(item =>
                                {
                                    return(
                                        <tr key={item.path} ref={node => this.tableEntries[item.path] = node}>
                                            <td><input type="checkbox" ref={node => this.checkboxes[item.path] = node} onChange={e => this.setItemSelection(item, e.target.checked)} /></td>
                                            <td><span className="glyphicon glyphicon-file"></span></td>
                                            <td>{item.name}</td>
                                            <td>{item.location}</td>
                                            <td>{Math.round(item.size / 1024)} KB</td>
                                            <td>{item.lastModified}</td>
                                            <td>
                                                {
                                                    this.props.allowDelete &&
                                                        <a href="#" onClick={() => this.deleteSingleItem(item)}><span className="glyphicon glyphicon-remove"></span></a>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.files, true)}>Select all</button>
                    <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.files, false)}>Deselect all</button>
                    <div className="form-submit text-right">
                        {
                            this.props.allowDelete &&
                                <button type="button" className="btn btn-default" onClick={() => this.deleteMultipleItems(Object.values(this.selectedFiles))}>Delete</button>
                        }
                        {
                            this.props.allowCreate &&
                                <button type="button" className="btn btn-primary" onClick={() => this.dropzone.open()}>Upload</button>
                        }
                    </div>
                    <Dropzone style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={files => this.uploadFiles(files)} />
                </div>
            );
        }
    }
}

export default FileManager;
