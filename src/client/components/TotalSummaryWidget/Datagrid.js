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
              header: "Supplier Id",
              accessor: "supplierid",
              id: "supplierid"
            },{
              header: "CustomerId",
              accessor: "customerid",
              id: "customerid"
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
                id: 'campaignid',
                desc: true
            }]}
          />
          <br />
        </div>
  );
  }
}
