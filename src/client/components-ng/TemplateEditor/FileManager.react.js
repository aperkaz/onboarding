import React from 'react';
import PropTypes from 'prop-types';
import ajax from 'superagent-bluebird-promise';
import { ContextComponent } from '../common';
import translations from './i18n';
import Dropzone from 'react-dropzone';
import Promise from 'bluebird';

class FileManager extends ContextComponent
{
    static propTypes = {
        tenantId : PropTypes.string.isRequired,
        filesDirectory : PropTypes.string,
        selectorVersion : PropTypes.bool,
        onFileSelection : PropTypes.func.isRequired,
        allowDelete : PropTypes.bool
    }

    static defaultProps = {
        selectorVersion : false,
        onFileSelection : () => { },
        allowDelete : true
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
        this.selectedFiles = { };
        this.checkboxes = { };
    }

    componentWillMount()
    {
        this.context.i18n.register('FileManager', translations);
    }

    componentDidMount()
    {
        this.updateFileList();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        nextContext.i18n.register('FileManager', translations);

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
        const notification = this.context.showNotification(this.context.i18n.getMessage('FileManager.notification.loadingFileList'), 'info');

        return this.getFiles().then(files => this.setState({ files : files }))
            .then(() => this.context.hideNotification(notification))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    deleteSingleItem(item)
    {
        return new Promise((resolve, reject) =>
        {
            const i18n = this.context.i18n;
            const title = i18n.getMessage('FileManager.modal.deleteSingleItem.title');
            const message = i18n.getMessage('FileManager.modal.deleteSingleItem.message', { name : item.name });
            const buttons = [ 'yes', 'no' ];
            const hideDialog = () => { this.context.hideModalDialog(); }
            const onButtonClick = (button) =>
            {
                if(button === 'yes')
                {
                    const successMessage = i18n.getMessage('FileManager.deleteSingleItem.notification.success', { name : item.name });
                    const path = this.state.filesDirectory + '/' + item.name;

                    return ajax.delete(`/blob/api/${this.state.tenantId}/files${path}`)
                        .then(() => this.updateFileList())
                        .then(() => this.context.showNotification(successMessage, 'success'))
                        .then(() => resolve(true))
                        .catch(e =>
                        {
                            this.context.showNotification(e.body.message || e.body, 'error', 10);
                            resolve(false);
                        });
                }
                else
                {
                    resolve(false);
                }

                this.context.hideModalDialog();
            }

            this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
        });
    }

    deleteSelectedItems()
    {
        return this.deleteMultipleItems(Object.values(this.selectedFiles));
    }

    deleteMultipleItems(items)
    {
        return new Promise((resolve, reject) =>
        {
            if(items && items.length)
            {
                const i18n = this.context.i18n;
                const title = i18n.getMessage('FileManager.modal.deleteMultipleItems.title');
                const message = i18n.getMessage('FileManager.modal.deleteMultipleItems.message', { count : items.length });
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
                                .catch(result => { throw new Error(result.body.message || result.body); });
                        });

                        const successMessage = i18n.getMessage('FileManager.deleteMultipleItems.notification.success', { count : items.length });

                        return Promise.all(all)
                            .then(() => this.context.showNotification(successMessage, 'success'))
                            .then(() => resolve(true))
                            .catch(e =>
                            {
                                this.context.showNotification(e.message, 'error', 10);
                                resolve(false);
                            })
                            .finally(() => this.updateFileList());
                    }
                    else
                    {
                        resolve(false);
                    }
                }

                this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
            }
            else
            {
                resolve(false)
            }
        });
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

        const i18n = this.context.i18n;
        const filename = file.name.replace('\/', '-');
        const path = this.state.filesDirectory + '/' + filename;
        const uploadingMessage = i18n.getMessage('FileManager.uploadFiles.notification.uploading', { name : filename });
        const notification = this.context.showNotification(uploadingMessage, 'info', 20);
        const formData = new FormData();

        formData.append('file', file);
        formData.append('name', filename);

        const successMessage = i18n.getMessage('FileManager.uploadFiles.notification.success');

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
            .then(() => this.context.showNotification(successMessage, 'success'))
            .catch(e => this.context.showNotification(e.body.message || e.body, 'error', 10))
            .finally(() => this.context.hideNotification(notification));
    }

    showUploadFileDialog()
    {
        this.dropzone.open();
    }

    selectAllFiles()
    {
        this.setItemSelection(this.state.files, true);
    }

    deselectAllFiles()
    {
        this.setItemSelection(this.state.files, false);
    }

    render()
    {
        const { i18n } = this.context;

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
                    <table className="table breakable">
                        <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>&nbsp;</th>
                                <th>{i18n.getMessage('FileManager.header.name')}</th>
                                <th>{i18n.getMessage('FileManager.header.location')}</th>
                                <th>{i18n.getMessage('FileManager.header.size')}</th>
                                <th>{i18n.getMessage('FileManager.header.modified')}</th>
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
                    <button type="button" className="btn btn-link" onClick={() => this.selectAllFiles()}>{i18n.getMessage('FileManager.button.selectAll')}</button>
                    <button type="button" className="btn btn-link" onClick={() => this.deselectAllFiles()}>{i18n.getMessage('FileManager.button.deselectAll')}</button>

                    <Dropzone style={{ display: 'none' }} ref={node => this.dropzone = node} onDrop={files => this.uploadFiles(files)} />
                </div>
            );
        }
    }
}

export default FileManager;
