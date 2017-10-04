import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent } from '../components-ng/common';
import { CampaignSearchForm, CampaignList } from '../components-ng/CampaignEditor';
import translations from './i18n';
import extend from 'extend';

class CampaignSearch extends ContextComponent
{
    constructor(props)
    {
        super(props);

        this.state = {
        }

        this.campaignList = null;
    }

    componentWillMount()
    {
        this.context.i18n.register('CampaignSearch', translations);
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        nextContext.i18n.register('CampaignSearch', translations);
    }

    handleResetForm(e)
    {}

    handleCreateCampaign(e)
    {
        this.context.router.push(`/create`);
    }

    handleSearch(e)
    {}

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
                            customerId={customerId} />
                        <div className="form-submit text-right">
                            <button className="btn btn-link" onClick={(e) => this.handleResetForm(e)}>{i18n.getMessage('System.reset')}</button>
                            <button className="btn btn-default" onClick={(e) => this.handleCreateCampaign(e)}>{i18n.getMessage('CampaignSearch.button.create')}</button>
                            <button className="btn btn-primary" onClick={(e) => this.handleSearch(e)}>{i18n.getMessage('System.search')}</button>
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
