import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CampaignDashboardDot from '../components/CampaignDashboardDot.react';
import _ from 'lodash';
import moment from 'moment';
import TotalSummary from '../components/TotalSummaryWidget/TotalSummary.react';

import { getAllCampaigns } from '../actions/campaigns/getAll';
import { loadCampaignContacts } from '../actions/campaignContacts/load';
import { getStatuses } from '../actions/campaigns/getStatuses';
import serviceComponent from '@opuscapita/react-loaders/lib/serviceComponent';

@connect(
  state => ({
    campaignList: state.campaignList,
    campaignContactsData: state.campaignContactList,
    campaignsStatus: state.campaignsStatus,
    currentUserData: state.currentUserData
  }),
  (dispatch) => ({
    getAllCampaigns: () => {
      dispatch(getAllCampaigns());
    },
    getStatuses: () => {
      dispatch(getStatuses());
    }
  })
)

class CampaignDashboard extends Component {
  // charts in order: Area, pie, stack, bar+line
  // actions in order: invoice, rfq, stamp, news

  static propTypes = {
    intl: intlShape.isRequired,
    campaignList: PropTypes.object.isRequired,
    campaignContactsData: PropTypes.object,
    currentUserData: PropTypes.object,
    params: PropTypes.object
  };


  static contextTypes = {
    router: PropTypes.object.isRequired,
    locale: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.component = {};
  }

  ConnectedSuppliers = React.createClass({
    componentWillMount() {
      let serviceRegistry = (service) => ({ url: '/einvoice-send' });
      const ConnectSupplierWidget = serviceComponent({ serviceRegistry, serviceName: 'einvoice-send' , moduleName: 'connect-supplier-widget' });

      this.externalComponents = { ConnectSupplierWidget };
    },

    render () {
      const { ConnectSupplierWidget } = this.externalComponents;
      const { intl } = this.props;

      return (
        <div className="panel panel-success">
          <div className="panel-heading">{intl.formatMessage({ id: 'campaignDashboard.component.connectedSuppliers'})}</div>
          <div className="panel-body">{<ConnectSupplierWidget actionUrl='' locale={this.props.locale} customerId={this.props.customerId} />}</div>
        </div>
      );
    }
  });

  componentDidMount(){
    this.props.getStatuses();
  };

  componentWillMount() {
    let serviceRegistry = (service) => ({ url: '/onboarding' });
    const FunnelChart = serviceComponent({ serviceRegistry, serviceName: 'onboarding' , moduleName: 'funnelChart', jsFileName: 'funnelChart' });
    const RecentCampaigns = serviceComponent({ serviceRegistry, serviceName: 'onboarding' , moduleName: 'recentCampaigns', jsFileName: 'recentCampaigns' });
    this.externalComponents = { FunnelChart, RecentCampaigns };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.campaignList.loading === false;
  }

  render() {
    const { FunnelChart, RecentCampaigns } = this.externalComponents;
    return (
      <div>
        <br/>
        <Row>
          <Col md={6}>
            <this.ConnectedSuppliers intl={this.props.intl} locale={this.context.locale} customerId={this.props.currentUserData.customerid}/>
            <FunnelChart />
          </Col>
          <Col md={6}>
            <RecentCampaigns />
            <TotalSummary intl={this.props.intl} campaigns={this.props.campaignsStatus} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default injectIntl(CampaignDashboard);
