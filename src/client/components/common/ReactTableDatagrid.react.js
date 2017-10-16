import React, { PropTypes, Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";




class Datagrid extends React.Component {

    static propTypes = {
        data : PropTypes.array,
        columns : PropTypes.array
    }

    static defaultProps = {
        data: [],
        columns: []
    }

    static contextTypes = {
        i18n: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            data : props.data,
            columns : []
        }
    }

    componentWillReceiveProps(nextProps){
        this.setState({data: nextProps.data})
    }

    shouldComponentUpdate(nextProps){
        if (this.state.columns == nextProps.columns && this.state.data == nextProps.data){
            return false;
        } else {
            return true;
        }
    }

    setColumns(columns){
        this.setState({ columns })
    }

    setData(data){
        this.setState({ data })
    }

    render() {
        const { i18n } = this.context;

    return (

        <div>
          <ReactTable
            data={this.state.data}
            columns={this.state.columns}
            defaultPageSize={10}
            className="-striped -highlight"
            sorted={[{ // the sorting model for the table
                id: 'companyname',
                desc: true
            }]}
            noDataText={i18n.getMessage('campaignDashboard.component.totalSummary.table.noDataText')}
            previousText={i18n.getMessage('campaignDashboard.component.totalSummary.table.previousText')}
            nextText={i18n.getMessage('campaignDashboard.component.totalSummary.table.nextText')}
            loadingText={i18n.getMessage('campaignDashboard.component.totalSummary.table.loadingText')}
            pageText={i18n.getMessage('campaignDashboard.component.totalSummary.table.pageText')}
            ofText={i18n.getMessage('campaignDashboard.component.totalSummary.table.ofText')}
            rowsText={i18n.getMessage('campaignDashboard.component.totalSummary.table.rowsText')}

            />
          <br />
        </div>
  );
  }
}

export default Datagrid;
