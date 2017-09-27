import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ModalDialog } from '../common';
import CampaignContactForm from './CampaignContactForm.react';
import { Contacts } from '../../api';
import extend from 'extend';
import translations from './i18n';

class CampaignContactList extends ContextComponent
{
    static propTypes = {
        campaignId : React.PropTypes.string.isRequired,
        customerId : React.PropTypes.string.isRequired,
        itemsPerPage : React.PropTypes.number.isRequired,
    }

    static defaultProps = {
        itemsPerPage : 25
    }

    constructor(props)
    {
        super(props);

        const basicState = { contacts : [ ], currentPage : 0 };

        this.state = extend(false, { }, basicState, props);

        this.contactsApi = new Contacts();
        this.editContactModal = null;
        this.camaignContactForm = null;
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignContactList', translations);
    }

    componentDidMount()
    {
        this.updateContactList(true);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        const propsChanged = Object.keys(nextPops).reduce((all, key) => all || nextPops[key] !== this.props[key], false);

        nextContext.i18n.register('CampaignContactList', translations);

        if(nextPops.campaignId != this.state.campaignId)
            this.updateContactList(true);

        if(propsChanged)
            this.setState(extend(false, { }, this.state, nextPops));
    }

    updateContactList(resetPage)
    {
        const { i18n, showNotification, hideNotification } = this.context;
        const currentPage = resetPage ? 0 : this.state.currentPage;

        const loadingMessage = showNotification(i18n.getMessage('CampaignContactList.notification.loadingContactList'));

        return this.contactsApi.getContacts(this.state.campaignId)
            .then(contacts => this.setState({ contacts, currentPage }))
            .catch(e => showNotification(e.message, 'error', 10))
            .finally(() => hideNotification(loadingMessage, 1000));
    }

    getPageClass(page)
    {
        return (this.state.currentPage + 1) === page ? 'active' : '';
    }

    handleRefresh(e)
    {
        e.preventDefault();
        return this.updateContactList(true);
    }

    handleExport(e)
    {
        e.preventDefault();
        document.location.replace(`/onboarding/api/campaigns/${this.state.campaignId}/contacts/export`);
    }

    handlePageChange(e, page, pageCount)
    {
        e.preventDefault();

        let { currentPage } = this.state;

        switch(page)
        {
            case 'next':
                currentPage++;
                break;
            case 'prev':
                currentPage--;
                break;
            default:
                currentPage = page;
        }

        if(currentPage < pageCount && currentPage >= 0)
            this.setState({ currentPage });
    }

    handleEditContact(e, contact)
    {
        const { i18n, showNotification } = this.context;
        const { campaignId } = this.state;
        const isEditMode = contact && contact.id > 0;
        const saveActionType = isEditMode ? 'update' : 'add';

        e.preventDefault();

        const title = i18n.getMessage(`CampaignContactList.editContactModal.title.${saveActionType}`);
        const buttons = {
            'save' : i18n.getMessage(`CampaignContactList.editContactModal.button.${saveActionType}`),
            'close' : i18n.getMessage('CampaignContactList.editContactModal.button.close')
        };

        const onButtonClick = (button) =>
        {
            if(button === 'save')
            {
                if(this.camaignContactForm.validateForm())
                {
                    if(isEditMode)
                    {
                        return this.camaignContactForm.saveContact()
                            .then(() => showNotification(i18n.getMessage('CampaignContactList.editContactModal.update.success'), 'success'))
                            .then(() => this.updateContactList())
                            .catch(e => showNotification(e.message, 'error', 10));
                    }
                    else
                    {
                        return this.camaignContactForm.saveContact()
                            .then(() => showNotification(i18n.getMessage('CampaignContactList.editContactModal.add.success'), 'success'))
                            .then(() => this.updateContactList())
                            .catch(e => showNotification(e.message, 'error', 10));
                    }
                }
                else
                {
                    return false;
                }
            }

            this.editContactModal.hide();
        }

        this.editContactModal.show(title, undefined, onButtonClick, buttons);

        if(isEditMode)
            this.camaignContactForm.loadContact(contact.id);
        else
            this.camaignContactForm.resetForm();
    }

    handleDeleteContact(e, contact)
    {
        e.preventDefault();

        const { i18n, showModalDialog, hideModalDialog, showNotification } = this.context;

        const contactName = `${contact.contactFirstName} ${contact.contactLastName}`;
        const title = i18n.getMessage('CampaignContactList.modal.deleteContact.title');
        const message = i18n.getMessage('CampaignContactList.modal.deleteContact.message', { contact : contactName });
        const buttons = [ 'yes', 'no' ];
        const onButtonClick = (button) =>
        {
            if(button === 'yes')
            {
                this.contactsApi.deleteContact(this.state.campaignId, contact.id)
                    .then(() => this.updateContactList())
                    .then(() => showNotification(i18n.getMessage('CampaignContactList.modal.deleteContact.success'), 'success'))
                    .catch(e => showNotification(e.message, 'error', 10));
            }

            hideModalDialog();
        }

        showModalDialog(title, message, buttons, onButtonClick);
    }

    renderPagination(totalPageCount)
    {
        const mapPageCount = (pageCount, callback) =>
        {
            const result = [ ];

            for(let i = 1; i <= pageCount; i++)
                result.push(callback(i));

            return result;
        }

        return (
            <nav>
                <ul className="pagination">
                    <li>
                        <a href="#" onClick={e => this.handlePageChange(e, 'prev', totalPageCount)}>
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    {
                        mapPageCount(totalPageCount, page =>
                        {
                            return(
                                <li key={page} className={this.getPageClass(page)}>
                                    <a href="#" onClick={e => this.handlePageChange(e, page - 1, totalPageCount)}>{page}</a>
                                </li>
                            );
                        })
                    }
                    <li>
                        <a href="#" onClick={e => this.handlePageChange(e, 'next', totalPageCount)}>
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        )
    }

    render()
    {
        const { i18n } = this.context;
        const { contacts, currentPage, itemsPerPage } = this.state;
        const totalPageCount = Math.ceil(contacts.length / itemsPerPage);
        const contactsStart = currentPage * itemsPerPage;
        const contactsLength = contactsStart + itemsPerPage;
        const contactsToRender = contacts.slice(contactsStart, contactsLength);

        return(
            <div className="campaignContactList">
                <div className="row">
                    <div className="col-sm-6">
                        <button className="btn btn-default pull-left" onClick={e => this.handleEditContact(e)}>
                              <span className="glyphicon glyphicon-plus"></span>&nbsp;
                              {i18n.getMessage('CampaignContactList.button.add')}
                        </button>
                        <button className="btn btn-default pull-left" onClick={e => this.handleRefresh(e)}>
                              <span className="glyphicon glyphicon-refresh"></span>&nbsp;
                              {i18n.getMessage('CampaignContactList.button.refresh')}
                        </button>
                        <button className="btn btn-success pull-left" onClick={e => this.handleExport(e)}>
                              <span className="glyphicon glyphicon-export"></span>&nbsp;
                              {i18n.getMessage('CampaignContactList.button.export')}
                        </button>
                    </div>
                    <div className="col-sm-6 text-right">
                    {
                        (totalPageCount && this.renderPagination(totalPageCount)) || ''
                    }
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{i18n.getMessage('CampaignContactList.header.email')}</th>
                                    <th>{i18n.getMessage('CampaignContactList.header.company')}</th>
                                    <th>{i18n.getMessage('CampaignContactList.header.supplierId')}</th>
                                    <th>{i18n.getMessage('CampaignContactList.header.status')}</th>
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    contactsToRender.map(contact =>
                                    {
                                        return(
                                            <tr key={contact.id}>
                                                <td>{contact.email}</td>
                                                <td>{contact.companyName}</td>
                                                <td>{contact.supplierId}</td>
                                                <td>{contact.status}</td>
                                                <td className="text-right">
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-default" onClick={e => this.handleEditContact(e, contact)}>
                                                            <span className="glyphicon glyphicon-edit"></span>&nbsp;
                                                            {i18n.getMessage('CampaignContactList.button.edit')}
                                                        </button>
                                                        <button className="btn btn-sm btn-default" onClick={e => this.handleDeleteContact(e, contact)}>
                                                            <span className="glyphicon glyphicon-trash"></span>&nbsp;
                                                            {i18n.getMessage('CampaignContactList.button.delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6"></div>
                    <div className="col-sm-6 text-right">
                    {
                        (totalPageCount && this.renderPagination(totalPageCount)) || ''
                    }
                    </div>
                </div>

                <ModalDialog ref={node => this.editContactModal = node}>
                    <CampaignContactForm
                        ref={node => this.camaignContactForm = node}
                        campaignId={this.state.campaignId} />
                </ModalDialog>
            </div>
        )
    }
}

export default CampaignContactList;
