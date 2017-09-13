import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import translations from './i18n';
import ModalDialog from '../common/ModalDialog.react';

class TemplateList extends Component
{
    static propTypes = {
        customerId : React.PropTypes.string.isRequired,
        templateFileDirectory : React.PropTypes.string,
        onCreate : React.PropTypes.func,
        onDelete : React.PropTypes.func,
        onEdit : React.PropTypes.func,
        allowDelete : React.PropTypes.bool.isRequired,
        allowCreate : React.PropTypes.bool.isRequired,
        allowEdit : React.PropTypes.bool.isRequired
    }

    static defaultProps = {
        onCreate : () => { },
        onDelete : () => { },
        onEdit : () => { },
        allowDelete : true,
        allowCreate : true,
        allowEdit : true
    }

    static contextTypes = {
        i18n : React.PropTypes.object.isRequired,
        showNotification : React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired,
        showModalDialog : React.PropTypes.func.isRequired,
        hideModalDialog : React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            customerId : this.props.customerId,
            tenantId : 'c_' + this.props.customerId,
            templateFileDirectory : this.props.templateFileDirectory,
            items : [ ],
            languages : null,
            countries : null
        }

        this.loading = false;
    }

    componentWillMount()
    {
        this.context.i18n.register('TemplateManager', translations);
    }

    componentDidMount()
    {
        if(!this.loading)
        {
            this.loading = true;
            this.loadLanguagesAndCountries();
            this.updateList();
        }
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(this.context != nextContext)
            this.context.i18n.register('TemplateList', translations);

        this.setState({
            customerId : nextPops.customerId,
            templateFileDirectory : this.makePathDirectory(nextPops.templateFileDirectory),
        });
    }

    makePathDirectory(path)
    {
        return this.makePathAbsolute(path.endsWith('/') ? path : path + '/');
    }

    makePathAbsolute(path)
    {
        return path.startsWith('/') ? path : '/' + path;
    }

    loadLanguagesAndCountries()
    {
        return Promise.all([
            ajax.get('/isodata/languages'),
            ajax.get('/isodata/countries')
        ])
        .spread((languages, countries) =>
        {
            this.setState({ languages : languages.body, countries : countries.body });
        })
    }

    getItems()
    {
        return ajax.get(`/onboarding/api/templates/${this.state.customerId}`)
            .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
            .catch(result => { throw new Error(result.body.message || result.body); });
    }

    deleteItem(item)
    {
        return ajax.delete(`/onboarding/api/templates/${this.state.customerId}/${item.id}`)
            .then(() => this.deleteFilesForItem(item.id))
            .then(() => this.props.onDelete(item))
            .catch(result => { throw new Error(result.body.message || result.body); });
    }

    deleteFilesForItem(itemId)
    {
        let path = this.state.templateFileDirectory;

        if(path)
        {
            if(!path.startsWith('/'))
                path = '/' + dir;
            if(!path.endsWith('/'))
                path += '/';

            path += itemId + '/';

            return ajax.delete(`/blob/api/${this.state.tenantId}/files${path}`)
                .query({ recursive: true })
                .catch(result => { throw new Error(result.body.message || result.body); });
        }

        return Promise.resolve();
    }

    updateList()
    {
        const message = this.context.i18n.getMessage('TemplateList.notification.loadingTemplateList');
        const notification = this.context.showNotification(message, 'info');

        return this.getItems().then(items => this.setState({ items : items }))
            .then(() => this.context.hideNotification(notification))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    setItemSelection(item, selected)
    {
        if(Array.isArray(item))
            return item.forEach(i => this.setItemSelection(i, selected));

        this.selectedItems = this.selectedItems || { };
        this.checkboxes[item.id].checked = selected;

        if(selected)
            this.selectedItems[item.id] = item;
        else
            delete this.selectedItems[item.id];
    }

    deleteSingleItem(item)
    {
        const i18n = this.context.i18n;
        const title = i18n.getMessage('TemplateList.modal.deleteSingleItem.title');
        const message = i18n.getMessage('TemplateList.modal.deleteSingleItem.message', { name : item.name });
        const buttons = [ 'yes', 'no' ];
        const hideDialog = () => { this.context.hideModalDialog(); }
        const onButtonClick = (button) =>
        {
            this.context.hideModalDialog();

            if(button === 'yes')
            {
                const successMessage = i18n.getMessage('TemplateList.notification.deleteSingleItem.templateRemoved', { name : item.name });

                return this.deleteItem(item)
                    .then(() => this.updateList())
                    .then(() => this.context.showNotification(successMessage, 'success'))
                    .catch(e => this.context.showNotification(e.message, 'error', 10));
            }
        }

        this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
    }

    deleteMultipleItems(items)
    {
        if(items && items.length)
        {
            const i18n = this.context.i18n;
            const title = i18n.getMessage('TemplateList.modal.deleteMultipleItems.title');
            const message = i18n.getMessage('TemplateList.modal.deleteMultipleItems.message', { count : items.length });
            const buttons = [ 'yes', 'no' ];
            const hideDialog = () => { this.context.hideModalDialog(); }
            const onButtonClick = (button) =>
            {
                this.context.hideModalDialog();

                if(button === 'yes')
                {
                    const successMessage = i18n.getMessage('TemplateList.notification.deleteMultipleItems.templatesRemoved', { count : items.length });
                    const all = items.map(item => this.deleteItem(item));

                    return Promise.all(all)
                        .then(() => this.context.showNotification(successMessage, 'success'))
                        .catch(e => this.context.showNotification(e.message, 'error', 10))
                        .finally(() => this.updateList());
                }
            }

            this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
        }
    }

    editSingleItem(item)
    {
        this.props.onEdit(item);
    }

    createNewItem()
    {
        this.props.onCreate();
    }

    render()
    {
        this.tableEntries = { };
        this.checkboxes = { };
        this.selectedItems = { };
        const { i18n } = this.context;

        return(
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>{i18n.getMessage('TemplateList.header.name')}</th>
                            <th>{i18n.getMessage('TemplateList.header.type')}</th>
                            <th>{i18n.getMessage('TemplateList.header.language')}</th>
                            <th>{i18n.getMessage('TemplateList.header.country')}</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.items.map(item =>
                            {
                                const language = this.state.languages[item.languageId];
                                const country = this.state.countries[item.countryId];

                                return(
                                    <tr key={item.id} ref={node => this.tableEntries[item.id] = node}>
                                        <td><input type="checkbox" ref={node => this.checkboxes[item.id] = node} onChange={e => this.setItemSelection(item, e.target.checked)} /></td>
                                        <td>{item.name}</td>
                                        <td>{i18n.getMessage(`TemplateList.type.${item.type}`)}</td>
                                        <td>{language && language.name}</td>
                                        <td>{country && country.name}</td>
                                        <td>
                                            {
                                                this.props.allowDelete &&
                                                    <a href="#" onClick={() => this.deleteSingleItem(item)}><span className="glyphicon glyphicon-remove"></span></a>
                                            }
                                            {
                                                this.props.allowEdit &&
                                                    <a href="#" onClick={() => this.editSingleItem(item)}><span className="glyphicon glyphicon-pencil"></span></a>
                                            }
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.items, true)}>{i18n.getMessage('TemplateList.button.selectAll')}</button>
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.items, false)}>{i18n.getMessage('TemplateList.button.deselectAll')}</button>
                <div className="form-submit text-right">
                    {
                        this.props.allowDelete &&
                            <button type="button" className="btn btn-default" onClick={() => this.deleteMultipleItems(Object.values(this.selectedItems))}>{i18n.getMessage('TemplateList.button.delete')}</button>
                    }
                    {
                        this.props.allowCreate &&
                            <button type="button" className="btn btn-primary" onClick={() => this.createNewItem()}>{i18n.getMessage('TemplateList.button.create')}</button>
                    }
                </div>
            </div>
        )
    }
}

export default TemplateList;