import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { PropTypes } from 'react';
import _ from 'lodash';
import './casomTableStyles.css';

const CampaignSearchResult = ({ campaigns }) => {
    if (_.size(campaigns) > 0) {
        return (
            <BootstrapTable data={campaigns} condensed={true} bordered={false} striped={true} hover={true}>
                <TableHeaderColumn width="20%" dataField="campaignId" isKey={true} dataAlign="left" dataSort={true}>
                    Campaign Id
                </TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField="status" dataSort={true} dataAlign="left">
                    Status
                </TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField="campaignType" dataSort={true} dataAlign="left">
                    Campaign Type
                </TableHeaderColumn>
                <TableHeaderColumn width="20%" dataField="owner" dataSort={true} dataAlign="left">
                    Owner
                </TableHeaderColumn>
                <TableHeaderColumn width="20%" dataAlign="right" dataFormat={renderActionPanel}/>
            </BootstrapTable>
        );
    }
    return null;
};

const renderActionPanel = (cell, row) => {
  return(
      <div className="btn-group">
          <button className="btn btn-sm btn-default" onClick={() => {console.log(row)}}>
              <span className="glyphicon glyphicon-edit"> </span>
              Edit
          </button>
          <button className="btn btn-sm btn-default">
              <span className="glyphicon glyphicon-trash"> </span>
              Delete
          </button>
      </div>
  );
};

CampaignSearchResult.propTypes = {
    campaigns: PropTypes.array
};

export default CampaignSearchResult;