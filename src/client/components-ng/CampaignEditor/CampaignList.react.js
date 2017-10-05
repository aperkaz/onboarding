import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent, ListTable } from '../common';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';
import { Campaigns } from '../../api';
import translations from './i18n';
import extend from 'extend';

class CampaignList extends ContextComponent
{
    static propTypes = {
        customerId : PropTypes.string.isRequired,
        onEdit : PropTypes.func.isRequired,
        onContacts : PropTypes.func.isRequired,
        onDelete : PropTypes.func.isRequired
    }

    static defaultProps = {
        onEdit : () => null,
        onContacts : () => null,
        onDelete : () => null
    }

    static columns = [{
            key : 'campaignId',
            name : 'CampaignList.header.campaignId'
        }, {
            key : 'startsOn',
            name : 'CampaignList.header.startsOn'
        }, {
            key : 'endsOn',
            name : 'CampaignList.header.endsOn'
        }, {
            key : 'status',
            name : 'CampaignList.header.status'
        }, {
            key : 'campaignType',
            name : 'CampaignList.header.campaignType'
        }
    ]

    constructor(props)
    {
        super(props);

        this.state = {
            customerId : props.customerId,
            columns : [ ],
            items : [ ]
        }

        this.campaignsApi = new Campaigns();
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignList', translations);
        this.setState({ columns : this.getTranslatedColumns() });
        this.reload();
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(nextContext.locale != this.context.locale)
            this.setState({ columns : this.getTranslatedColumns() });
    }

    getTranslatedColumns()
    {
        const { i18n } = this.context;
        return CampaignList.columns.map(col => ({ key : col.key, name : i18n.getMessage(col.name) }))
    }

    loadCampaigns()
    {
        const { customerId } = this.state;
        const { i18n, showNotification, hideNotification } = this.context;

        const loadingMessage = showNotification(i18n.getMessage('CampaignList.notification.loading'));

        return this.campaignsApi.getCampaigns(customerId).map(item =>
        {
            if(item.startsOn)
                item.startsOn = i18n.formatDate(item.startsOn);
            if(item.endsOn)
                item.endsOn = i18n.formatDate(item.endsOn);

            return item;
        })
        .then(items =>
        {
            this.setState({ items });
            hideNotification(loadingMessage);
        })
        .catch(e =>
        {
            hideNotification(loadingMessage);
            showNotification(e.message, 'error', 10);
        });
    }

    reload()
    {
        return this.loadCampaigns();
    }

    handleOnButtonClick(type, item)
    {
        if(type === 'edit')
        {
            this.props.onEdit(item);
        }
        else if(type === 'contacts')
        {
            this.props.onContacts(item);
        }
        else if(type === 'delete')
        {
            const { i18n, showModalDialog, showNotification, hideNotification } = this.context;
            const title = i18n.getMessage('CampaignList.deleteItemModal.title');
            const message = i18n.getMessage('CampaignList.deleteItemModal.message', { campaignId : item.campaignId });
            const buttons = { 'no' : i18n.getMessage('System.no'), 'yes' : i18n.getMessage('System.yes') };
            const onButtonClick = (button) =>
            {
                if(button === 'yes' && this.props.onDelete(item) !== false)
                {
                    const notification = showNotification(i18n.getMessage('CampaignList.notification.deletingCampaign'));

                    return this.campaignsApi.deleteCampaign(item.campaignId).then(result =>
                    {
                        showNotification(i18n.getMessage('CampaignList.notification.deletingCampaign.success'), 'success');
                        hideNotification(notification);

                        return this.reload();
                    })
                    .catch(e =>
                    {
                        showNotification(e.message, 'error', 10);
                        hideNotification(notification);
                    })
                }
            }

            showModalDialog(title, message, onButtonClick, buttons);
        }
    }

    render()
    {
        const state = this.state;
        const { i18n } = this.context;
        const { columns, items } = state;
        const itemButtons = [{
            key : 'edit',
            label : i18n.getMessage('System.edit'),
            icon : 'edit'
        }, {
            key : 'contacts',
            label : i18n.getMessage('CampaignList.button.contacts'),
            icon : 'envelope'
        }, {
            key : 'delete',
            label : i18n.getMessage('System.delete'),
            icon : 'trash'
        }]

        return(
            <div className="row">
                <div className="col-xs-12">
                    {
                        items && items.length &&
                        <ListTable
                            columns={columns}
                            items={items}
                            itemButtons={itemButtons}
                            onButtonClick={(...args) => this.handleOnButtonClick(...args)} />
                    }
                </div>
            </div>
        );
    }
}

export default CampaignList;
