import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import React, { Component, PropTypes } from 'react';
import DeleteModal from '../common/DeleteModal.react';
import _ from 'lodash';
import DateConverter from 'opuscapita-i18n/lib/converters/DateConverter';
import { injectIntl, intlShape } from 'react-intl';
import './customTableStyles.css';
import StartModal from '../common/StartModal.react';

class CampaignSearchResult extends Component {

  static propTypes = {
    campaigns: PropTypes.array,
    onDeleteCampaign: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onGoToContacts: PropTypes.func.isRequired,
    intl: intlShape.isRequired
  };

  static contextTypes = {
    locale: React.PropTypes.string.isRequired,
    formatPatterns: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      deleteCampaignModalOpen: false,
      startCampaignModalOpen: false
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

  showStartModal(campaign) {
    this.setState({
      startCampaignModalOpen: true,
      startingCampaignId: campaign.campaignId
    })
    this.props.onLoadCampaignContacts(campaign.campaignId);
  }

  hideStartModal() {
    this.setState({
      startCampaignModalOpen: false,
      startingCampaignId: undefined
    });
  }

  formatDateField(cell, row) {
    const { locale, formatPatterns } = this.context;
    let dateConverter = new DateConverter(formatPatterns[locale].datePattern, locale);

    if (!_.isUndefined(cell) && !_.isNull(cell)) {
      return dateConverter.valueToString(cell);
    }

    return cell;
  }

  renderActionPanel(cell, row) {
    const { intl } = this.props;
    return (
      <div className="btn-group">
        <button className="btn btn-sm btn-default" onClick={() => this.props.onEdit(row.campaignId)}>
          <span className="glyphicon glyphicon-edit" />
          {intl.formatMessage({ id: 'campaignEditor.searchResult.button.edit' })}
        </button>

        <button className="btn btn-sm btn-default" onClick={() => this.props.onGoToContacts(row.campaignId)}>
          <span className="glyphicon glyphicon-envelope" />
          {intl.formatMessage({ id: 'campaignEditor.searchResult.button.contacts' })}
        </button>

        <button className="btn btn-sm btn-default" onClick={() => {
          this.showDeleteModal(row)
        }}
        >
          <span className="glyphicon glyphicon-trash" />
          {intl.formatMessage({ id: 'campaignEditor.searchResult.button.delete' })}
        </button>
         {row.status === 'new' ? <button className="btn btn-sm btn-default" onClick={() => {
           this.showStartModal(row)
         }}
         >
          <span className="glyphicon" />
          {intl.formatMessage({ id: 'campaignEditor.searchResult.button.start' })}
        </button> : false}


      </div>
    );
  }

  render() {
    const { intl } = this.props;
    if (_.size(this.props.campaigns) > 0) {
      return (
        <div>
          <BootstrapTable data={this.props.campaigns} condensed={true} bordered={false} striped={true} hover={true}>
            <TableHeaderColumn dataField="campaignId" isKey={true} dataAlign="left" dataSort={true}>
              {intl.formatMessage({ id: 'campaignEditor.searchResult.campaignId.label' })}
            </TableHeaderColumn>

            <TableHeaderColumn dataFormat={::this.formatDateField} dataField="startsOn" dataAlign="left"
              dataSort={true}
            >
              {intl.formatMessage({ id: 'campaignEditor.searchResult.startsOn.label' })}
            </TableHeaderColumn>
            <TableHeaderColumn dataFormat={::this.formatDateField} dataField="endsOn" dataAlign="left" dataSort={true}>
              {intl.formatMessage({ id: 'campaignEditor.searchResult.endsOn.label' })}
            </TableHeaderColumn>

            <TableHeaderColumn dataField="status" dataSort={true} dataAlign="left">
              {intl.formatMessage({ id: 'campaignEditor.searchResult.status.label' })}
            </TableHeaderColumn>
            <TableHeaderColumn dataField="campaignType" dataSort={true} dataAlign="left">
              {intl.formatMessage({ id: 'campaignEditor.searchResult.campaignType.label' })}
            </TableHeaderColumn>
            <TableHeaderColumn dataField="owner" dataSort={true} dataAlign="left">
              {intl.formatMessage({ id: 'campaignEditor.searchResult.owner.label' })}
            </TableHeaderColumn>
            <TableHeaderColumn dataAlign="right" dataFormat={::this.renderActionPanel}/>
          </BootstrapTable>
          <DeleteModal
            isOpen={this.state.deleteCampaignModalOpen}
            onDelete={() => {
              this.props.onDeleteCampaign(this.state.deletingCampaignId)
            }}
            onHide={::this.hideDeleteModal}
          />
          { this.state.startCampaignModalOpen &&
            <StartModal
              isOpen={this.state.startCampaignModalOpen}
              onStart={() => {
                this.props.onStartCampaign(this.state.startingCampaignId)
              }}
              onHide={::this.hideStartModal}
              contacts={this.props.contacts}
            />
          }

        </div>

      );
    }
    return null;
  }
}


export default injectIntl(CampaignSearchResult);
