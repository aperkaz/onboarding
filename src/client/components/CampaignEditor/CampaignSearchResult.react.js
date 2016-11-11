import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import React, {Component, PropTypes } from 'react';
import CampaignDeleteModal from './CampaignDeleteModal.react';
import _ from 'lodash';
import './casomTableStyles.css';

export default class CampaignSearchResult extends Component {

    static propTypes = {
        campaigns: PropTypes.array,
        onDeleteCampaign: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            deleteCampaignModalOpen: false
        }
    }

    hideDeleteModal() {
        this.setState({
            deleteCampaignModalOpen: false,
            deletingCampaignId: undefined
        });
    }

    showDeleteModal(campaign) {
        this.setState({
            deleteCampaignModalOpen: true,
            deletingCampaignId: campaign.campaignId
        })
    }

    renderActionPanel (cell, row) {
        return(
            <div className="btn-group">
                <button className="btn btn-sm btn-default" onClick={() => {console.log(row)}}>
                    <span className="glyphicon glyphicon-edit"> </span>
                    Edit
                </button>
                <button className="btn btn-sm btn-default" onClick={() => {this.showDeleteModal(row)}}>
                    <span className="glyphicon glyphicon-trash"> </span>
                    Delete
                </button>
            </div>
        );
    };

    render() {
        if (_.size(this.props.campaigns) > 0) {
            return (
                <div>
                    <BootstrapTable data={this.props.campaigns} condensed={true} bordered={false} striped={true} hover={true}>
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
                        <TableHeaderColumn width="20%" dataAlign="right" dataFormat={::this.renderActionPanel}/>
                    </BootstrapTable>
                    <CampaignDeleteModal
                        isOpen={this.state.deleteCampaignModalOpen}
                        onDelete={() => {this.props.onDeleteCampaign(this.state.deletingCampaignId)}}
                        onHide={::this.hideDeleteModal}
                    />
                </div>

            );
        }
        return null;
    }
}



