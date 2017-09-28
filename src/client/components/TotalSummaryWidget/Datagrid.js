import React, { PropTypes, Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";




export default class Datagrid extends React.Component {

    static propTypes = {
        data : PropTypes.array.isRequired
    }

    static defaultProps = {
        data: []
    }


    static propTypes = {
        data: React.PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            data : props.data
        }
    }

    render() {
        const columns = [
            {
              header: "Company Name",
              accessor: "companyname",
              id: "companyname"
            },{
              header: "Email",
              accessor: "email",
              id: "email"
            },{
              header: "Campaign Id",
              accessor: "campaignid",
              id: "campaignid"
            },{
              header: "Campaign Description",
              accessor: "description",
              id: "description"
            },{
              header: "Email",
              accessor: "email",
              id: "email"
            },{
              header: "Status",
              accessor: "status",
              id: "status"
            },{
              header: "Cistomer Supplier Id",
              accessor: "customersupplierid",
              id: "customersupplierid"
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
          />
          <br />
        </div>
  );
  }
}
