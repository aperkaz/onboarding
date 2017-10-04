import React from 'react';
import _ from 'lodash';
import { Col, Panel } from 'react-bootstrap';
import ModalDialog from '../common/ModalDialog.react';
import { injectIntl } from 'react-intl';
import request from 'superagent-bluebird-promise';
import Datagrid from './Datagrid'





class TotalSummary extends React.Component {
    sum = (campaigns, label) => campaigns.reduce( (result, value) => result + (value[label] || 0), 0);
    formatValue = (campaigns, label) => this.sum(campaigns, label) || '-/-';
    STATUSES = ['started', 'bounced', 'read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'connected'];

    getDBStatuses(status){
        return {
            "started": ['new', 'queued', 'generatingInvitation', 'invitationGenerated', 'sending', 'sent'],
            'bounced': ['bounced'],
            'error': ['bounced'],
            'read': ['read'],
            'loaded': ['loaded'],
            'registered': ['registered', 'needsVoucher', 'gemeratingVoucher'],
            'serviceConfig': ['serviceConfig'],
            'onboarded': ['onboarded'],
            'connected': ['connected']
        }[status];
    }


  static propTypes = {
      campaigns: React.PropTypes.array,
      actionUrl: React.PropTypes.string.isRequired,

  };

  static contextTypes = {
      i18n: React.PropTypes.object.isRequired
  };

  constructor(props)
  {
      super(props);
  }

  state = {
      modalDialog: { visible : false }
  };

  showModalDialog = (title, message, buttons, onButtonClick) =>
  {
      const modalDialog = {
          visible: true,
          title: title,
          message: message,
          buttons: buttons,
          onButtonClick: onButtonClick,
          size: 'large'
      }

      this.setState({ modalDialog: modalDialog });
  }

  hideModalDialog = () =>
    {
        this.setState({ modalDialog: { visible : false } });
    }




    getData(status)
    {
        const dbstatuses = this.getDBStatuses(status).join(',');

        const { actionUrl } = this.props;
        return request.get(`${actionUrl}/onboarding/api/contacts/${dbstatuses}`).
            set('Content-Type', 'application/json').
            then(response => {
                const contacts = response.body.map(contact => ({
                    status: contact['Status'],
                    email: contact['email'],
                    customersupplierid: contact['customerSupplierId'],
                    campaignid: contact['Campaign.CampaignId'],
                    companyname: contact['companyName'],
                    description: contact['Campaign.description']
                }));
                this.setState({ contacts: contacts });
                return Promise.resolve(null);
        }).
        catch(error => Promise.resolve(null));
    }

    render()
    {

        const { intl } = this.props;
        const { i18n } = this.context;

        return (
            <div>
            <div className="panel panel-success">
                <div className="panel-heading">{intl.formatMessage({ id: 'campaignDashboard.component.totalSummary'})}</div>
                    <div className="panel-body">
                        {_.map(this.STATUSES, (status) => (
                            <Col key={status} xs={4} className="TotalSummary-panel">
                                <Panel
                                    header={_.toUpper(intl.formatMessage({ id: `campaignDashboard.statuses.${status}` }))}
                                    onClick={()=> {
                                        this.getData(status).then(() =>
                                            this.showModalDialog(
                                                _.toUpper(intl.formatMessage({ id: `campaignDashboard.statuses.${status}` })),
                                                "",
                                                ['ok','cancel'],
                                                this.hideModalDialog)
                                        )
                                    }}>
                                    {this.formatValue(this.props.campaigns, status)}
                                </Panel>
                            </Col>
                        ))}
                    </div>
            </div>
            <div>
                <ModalDialog
                        visible={this.state.modalDialog.visible}
                        title={this.state.modalDialog.title}
                        message={this.state.modalDialog.message}
                        buttons={this.state.modalDialog.buttons}
                        onButtonClick={this.state.modalDialog.onButtonClick}
                        size={this.state.modalDialog.size}
                >
                    <Datagrid data={this.state.contacts}/>
                </ModalDialog>
            </div>
            </div>
        );
    }
}


export default injectIntl(TotalSummary);
