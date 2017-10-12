import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent } from '../components/common';
import { CampaignSearchForm, CampaignList } from '../components/CampaignEditor';
import translations from './i18n';
import extend from 'extend';

class CampaignSearch extends ContextComponent
{
    constructor(props, context)
    {
        super(props);

        context.i18n.register('CampaignSearch', translations);
        
        this.searchForm = null;
        this.campaignList = null;
    }

    handleResetForm(e)
    {
        e.preventDefault();
        this.searchForm.clearForm();
    }

    handleOnSearch(e)
    {
        e.preventDefault();

        const searchItem = this.searchForm.getItemFromState();
    }

    handleCreateCampaign(e)
    {
        e.preventDefault();

        this.context.router.push(`/create`);
    }

    handleOnEdit(item)
    {
        this.context.router.push(`/edit/${item.campaignId}`);
    }

    handleOnContacts(item)
    {
        this.context.router.push(`/edit/${item.campaignId}/contacts`);
    }

    render()
    {
        const { i18n } = this.context;
        const customerId = this.context.userData.customerid;

        return(
            <div>
                {
                    customerId &&
                    <div>
                        <CampaignSearchForm
                            ref={node => this.searchForm = node}
                            customerId={customerId} />
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={(e) => this.handleResetForm(e)}>{i18n.getMessage('System.reset')}</button>
                            <button className="btn btn-default" onClick={(e) => this.handleCreateCampaign(e)}>{i18n.getMessage('CampaignSearch.button.create')}</button>
                            <button className="btn btn-primary" onClick={(e) => this.handleOnSearch(e)}>{i18n.getMessage('System.search')}</button>
                        </div>
                        <hr />
                        <CampaignList
                            ref={node => this.campaignList = node}
                            customerId={customerId}
                            onEdit={item => this.handleOnEdit(item)}
                            onContacts={item => this.handleOnContacts(item)} />
                    </div>
                }
            </div>
        );
    }
}

export default CampaignSearch;
