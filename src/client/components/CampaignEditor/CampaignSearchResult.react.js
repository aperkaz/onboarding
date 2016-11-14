import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import React, { Component, PropTypes } from 'react';
import CampaignDeleteModal from './CampaignDeleteModal.react';
import _ from 'lodash';
import { DateConverter } from '../../../utils/converters';
import './casomTableStyles.css';

export default class CampaignSearchResult extends Component {

  static propTypes = {
    campaigns: PropTypes.array,
    onDeleteCampaign: PropTypes.func.isRequired
  };

  static contextTypes = {
    locale: React.PropTypes.string.isRequired,
    formatPatterns: React.PropTypes.object.isRequired
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

  formatDateField(cell, row) {
    const {locale, formatPatterns} = this.context;
    let dateConverter = new DateConverter(formatPatterns[locale].datePattern, locale);

    if (!_.isUndefined(cell) && !_.isNull(cell)) {
      return dateConverter.valueToString(cell);
    }

    return cell;
  }

  renderActionPanel(cell, row) {
    return (
      <div className="btn-group">
        <button className="btn btn-sm btn-default" onClick={() => {
          console.log(row)
        }}>
          <span className="glyphicon glyphicon-edit"> </span>
          Edit
        </button>
        <button className="btn btn-sm btn-default" onClick={() => {
          this.showDeleteModal(row)
        }}>
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
            <TableHeaderColumn  dataField="campaignId" isKey={true} dataAlign="left" dataSort={true}>
              Campaign Id
            </TableHeaderColumn>

            <TableHeaderColumn dataFormat={::this.formatDateField} dataField="startsOn" dataAlign="left" dataSort={true}>
              Starts On
            </TableHeaderColumn>
            <TableHeaderColumn  dataFormat={::this.formatDateField} dataField="endsOn" dataAlign="left" dataSort={true}>
              Ends On
            </TableHeaderColumn>

            <TableHeaderColumn  dataField="status" dataSort={true} dataAlign="left">
              Status
            </TableHeaderColumn>
            <TableHeaderColumn  dataField="campaignType" dataSort={true} dataAlign="left">
              Campaign Type
            </TableHeaderColumn>
            <TableHeaderColumn  dataField="owner" dataSort={true} dataAlign="left">
              Owner
            </TableHeaderColumn>
            <TableHeaderColumn  dataAlign="right" dataFormat={::this.renderActionPanel}/>
          </BootstrapTable>
          <CampaignDeleteModal
            isOpen={this.state.deleteCampaignModalOpen}
            onDelete={() => {
              this.props.onDeleteCampaign(this.state.deletingCampaignId)
            }}
            onHide={::this.hideDeleteModal}
          />
        </div>

      );
    }
    return null;
  }
}



