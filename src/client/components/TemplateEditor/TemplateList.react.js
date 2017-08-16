import React, { Component } from 'react';
import ajax from 'superagent-bluebird-promise';
import Promise from 'bluebird';
import ModalDialog from '../common/ModalDialog.react';

class TemplateList extends Component
{
    static propTypes = {
        customerId : React.PropTypes.string.isRequired,
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
        showNotification : React.PropTypes.func.isRequired,
        hideNotification : React.PropTypes.func.isRequired,
        showModalDialog : React.PropTypes.func.isRequired,
        hideModalDialog : React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);

        this.state = {
            items : [ ],
            languages : null,
            countries : null
        }

        this.typesToStirng = {
            email : 'Email',
            landingpage : 'Landingpage'
        }

        this.loading = false;
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
        return ajax.get(`/onboarding/api/templates/${this.props.customerId}`)
            .then(result => result.body.sort((a, b) => a.name.localeCompare(b.name)))
            .catch(result => { throw new Error(result.body.message || result.body); });
    }

    deleteItem(item)
    {
        return ajax.delete(`/onboarding/api/templates/${this.props.customerId}/${item.id}`)
            .then(() => this.props.onDelete(item))
            .catch(result => { throw new Error(result.body.message || result.body); });
    }

    updateList()
    {
        const notification = this.context.showNotification('Loading template list...', 'info');

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
        const title = 'Remove template';
        const message = `Do you really want to remove the template named "${item.name}"?`;
        const buttons = [ 'yes', 'no' ];
        const hideDialog = () => { this.context.hideModalDialog(); }
        const onButtonClick = (button) =>
        {
            this.context.hideModalDialog();

            if(button === 'yes')
            {
                return this.deleteItem(item)
                    .then(() => this.updateList())
                    .then(() => this.context.showNotification(`Template "${item.name}" successfully removed.`, 'success'))
                    .catch(e => this.context.showNotification(e.message, 'error', 10));
            }
        }

        this.context.showModalDialog(title, message, buttons, onButtonClick, hideDialog);
    }

    deleteMultipleItems(items)
    {
        if(items && items.length)
        {
            const title = 'Remove templates';
            const message = `Do you really want to remove ${items.length} templates?`;
            const buttons = [ 'yes', 'no' ];
            const hideDialog = () => { this.context.hideModalDialog(); }
            const onButtonClick = (button) =>
            {
                this.context.hideModalDialog();

                if(button === 'yes')
                {
                    const all = items.map(item => this.deleteItem(item));

                    return Promise.all(all)
                        .then(() => this.context.showNotification(`${items.length} templates have been successfully removed.`, 'success'))
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

        return(
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Language</th>
                            <th>Country</th>
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
                                        <td>{this.typesToStirng[item.type]}</td>
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
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.items, true)}>Select all</button>
                <button type="button" className="btn btn-link" onClick={() => this.setItemSelection(this.state.items, false)}>Deselect all</button>
                <div className="form-submit text-right">
                    {
                        this.props.allowDelete &&
                            <button type="button" className="btn btn-default" onClick={() => this.deleteMultipleItems(Object.values(this.selectedItems))}>Delete</button>
                    }
                    {
                        this.props.allowCreate &&
                            <button type="button" className="btn btn-primary" onClick={() => this.createNewItem()}>Create</button>
                    }
                </div>
            </div>
        )
    }
}

export default TemplateList;
