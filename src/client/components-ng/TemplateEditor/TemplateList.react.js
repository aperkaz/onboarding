import React, { Component } from 'react';
import Api from './api';
import Promise from 'bluebird';
import translations from './i18n';
import { ModalDialog } from '../common';

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
        locale : React.PropTypes.string.isRequired,
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
            languages : { },
            countries : { }
        }
    }

    componentWillMount()
    {
        this.context.i18n.register('TemplateManager', translations);
    }

    componentDidMount()
    {
        return this.reload();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(this.context.locale != nextContext.locale)
        {
            nextContext.i18n.register('TemplateList', translations);
            this.updateList(nextContext.locale);
        }

        this.setState({
            customerId : nextPops.customerId,
            templateFileDirectory : this.makePathDirectory(nextPops.templateFileDirectory),
        });
    }

    reload()
    {
        return this.updateList();
    }

    makePathDirectory(path)
    {
        return this.makePathAbsolute(path.endsWith('/') ? path : path + '/');
    }

    makePathAbsolute(path)
    {
        return path.startsWith('/') ? path : '/' + path;
    }

    deleteItem(item)
    {
        return Api.deleteTemplate(this.state.customerId, item.id, this.state.templateFileDirectory)
            .then(() => this.props.onDelete(item))
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    updateList(locale)
    {
        const message = this.context.i18n.getMessage('TemplateList.notification.loadingTemplateList');
        const notification = this.context.showNotification(message, 'info');
        const customerId = this.state.customerId;
        locale = locale || this.context.locale;

        return Promise.all([
            Api.getTemplates(customerId),
            Api.getCountries(locale),
            Api.getLanguages(locale)
        ])
        .spread((items, countries, languages) => this.setState({ items, countries, languages }))
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
        const buttons = { 'yes' : i18n.getMessage('System.yes'), 'no' : i18n.getMessage('System.no') };
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

        this.context.showModalDialog(title, message, onButtonClick, buttons);
    }

    deleteMultipleItems(items)
    {
        if(items && items.length)
        {
            const i18n = this.context.i18n;
            const title = i18n.getMessage('TemplateList.modal.deleteMultipleItems.title');
            const message = i18n.getMessage('TemplateList.modal.deleteMultipleItems.message', { count : items.length });
            const buttons = { 'yes' : i18n.getMessage('System.yes'), 'no' : i18n.getMessage('System.no') };
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

            this.context.showModalDialog(title, message, onButtonClick, buttons);
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
        const { state } = this;

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
                            state.items && state.items.map(item =>
                            {
                                const language = state.languages[item.languageId];
                                const country = state.countries[item.countryId];

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
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(state.items, true)}>{i18n.getMessage('TemplateList.button.selectAll')}</button>
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(state.items, false)}>{i18n.getMessage('TemplateList.button.deselectAll')}</button>
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
