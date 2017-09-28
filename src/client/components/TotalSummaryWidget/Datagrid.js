import React, { PropTypes, Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import { injectIntl } from 'react-intl';




class Datagrid extends React.Component {

    static propTypes = {
        data : PropTypes.array.isRequired
    }

    static defaultProps = {
        data: []
    }


    static propTypes = {
        data: React.PropTypes.array.isRequired,
    };

    static contextTypes = {
        i18n: React.PropTypes.object
    };


    constructor(props) {
        super(props);

        this.state = {
            data : props.data
        }
    }

    render() {
        const { intl } = this.props;


        const columns = [
            {
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.companyName'}),
              accessor: "companyname",
              id: "companyname",
              minWidth: 110
            },{
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.email'}),
              accessor: "email",
              id: "email",
              minWidth: 130
            },{
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.campaignId'}),
              accessor: "campaignid",
              id: "campaignid",
              maxWidth: 110
            },{
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.description'}),
              accessor: "description",
              id: "description",
              maxWidth: 260
            },{
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.status'}),
              accessor: "status",
              id: "status",
              maxWidth: 80
            },{
              header: intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.columns.customerSupplierId'}),
              accessor: "customersupplierid",
              id: "customersupplierid",
              maxWidth:100
            }
        ];

    return (
        <div>
          <ReactTable
            data={this.state.data}
            columns={columns}
            defaultPageSize={10}
            className="-striped -highlight"
            sorted={[{ // the sorting model for the table
                id: 'companyname',
                desc: true
            }]}
            noDataText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.noDataText'})}
            previousText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.previousText'})}
            nextText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.nextText'})}
            loadingText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.loadingText'})}
            pageText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.pageText'})}
            ofText={this.context.i18n.getMessage('Default.ok')}
            rowsText={intl.formatMessage({ id: 'campaignDashboard.component.totalSummary.table.rowsText'})}

            />
          <br />
        </div>
  );
  }
}

export default injectIntl(Datagrid);
