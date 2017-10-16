import React from 'react';
import { ContextComponent } from '../common';
import { Campaigns } from '../../api';
import PropTypes from 'prop-types';
import translations from './i18n';
import ModalDialog from '../common/ModalDialog.react';
import request from 'superagent-bluebird-promise';
import Datagrid from '../common/ReactTableDatagrid.react'
import {getDBStatuses} from '../../../utils/dataNormalization/transformStatus'


class TotalSummaryWidget extends ContextComponent
{
    static propTypes = {
        customerId : PropTypes.string.isRequired
    }

    static statuses = ['started', 'bounced', 'read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'connected'];

    constructor(props)
    {
        super(props);

        this.state = {
            stats : { },
            modalDialog: { visible : false }
        }

        this.campaignsApi = new Campaigns();
        this.modalDialog = null;
        this.dataGrid = null;
    }

    componentWillMount()
    {
        this.context.i18n.register('TotalSummaryWidget', translations);

    }

    componentDidMount()
    {


        return this.reload();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        if(nextContext.locale != this.context.locale)
            return this.reload();
    }


    showModalDialog = (title, message, buttons, onButtonClick) =>
    {
        var size = 'large';

        const { i18n } = this.context;

        const columns = [
            {
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.companyName'),
              accessor: "companyname",
              id: "companyname",
              minWidth: 110
            },{
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.email'),
              accessor: "email",
              id: "email",
              minWidth: 130
            },{
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.campaignId'),
              accessor: "campaignid",
              id: "campaignid",
              maxWidth: 110
            },{
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.description'),
              accessor: "description",
              id: "description",
              maxWidth: 260
            },{
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.status'),
              accessor: "status",
              id: "status",
              maxWidth: 80
            },{
              header: i18n.getMessage('campaignDashboard.component.totalSummary.columns.customerSupplierId'),
              accessor: "customersupplierid",
              id: "customersupplierid",
              maxWidth:100
            }
        ];

        this.dataGrid.setColumns(columns);

        this.dataGrid.setData(this.state.contacts);
        if(this.modalDialog)
            this.modalDialog.show(title, message, onButtonClick, buttons, size);
    }





    getData(status)
    {
        const dbstatuses1 = getDBStatuses(status);
        const dbstatuses = dbstatuses1.join(',');


        return request.get(`/onboarding/api/contacts/${dbstatuses}`).
            then(response => {
                const contacts = response.body.map(contact => ({
                    status: contact['Status'],
                    email: contact['email'],
                    customersupplierid: contact['customerSupplierId'],
                    campaignid: contact['Campaign.CampaignId'],
                    companyname: contact['companyName'],
                    description: contact['Campaign.description']
                }));
                console.log(contacts);
                this.setState({ contacts });
        }).
        catch(error => this.context.showNotification(error.message, 'error', 10));
    }

    handleDetailClick(e, status){
        e.preventDefault();
        console.log('pretend to be clicked');
        this.getData(status).then(() =>
            this.showModalDialog(
                this.context.i18n.getMessage(`TotalSummaryWidget.label.${status}`).toUpperCase()
            )
        )
    }

    reload()
    {
        console.log(this);
        return this.campaignsApi.getCampaignStats(this.props.customerId).then(stats =>
        {
            const results = { };
            stats.forEach(item => results[item.status] = (results[item.status] || 0) + item.statusCount);

            return results;
        })
        .then(stats => this.setState({ stats }))
        .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    render()
    {
        const { i18n } = this.context;
        const { stats } = this.state;

        return(
            <div className="panel panel-success">
                <div className="panel-heading">
                    {i18n.getMessage('TotalSummaryWidget.title')}
                </div>
                <div className="panel-body">
                    {
                        stats && TotalSummaryWidget.statuses.map(status =>
                        {
                            return(
                                <div key={status} className="col-xs-4 TotalSummary-panel">
                                    <div className="panel panel-default"
                                    onClick={(e) =>this.handleDetailClick(e, status)}>
                                        <div className="panel-heading">
                                            {i18n.getMessage(`TotalSummaryWidget.label.${status}`)}
                                        </div>
                                        <div className="panel-body">
                                            {stats[status] || '-'}
                                        </div>
                                    </div>

                                    <ModalDialog ref={node => this.modalDialog = node} size='large' >
                                        <Datagrid ref={node => this.dataGrid = node}/>
                                    </ModalDialog>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default TotalSummaryWidget;
