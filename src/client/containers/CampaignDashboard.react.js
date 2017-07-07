import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CampaignDashboardDot from '../components/CampaignDashboardDot.react';
import _ from 'lodash';
import moment from 'moment';
import RecentCampaigns from '../components/RecentCampaignsChartWidget/RecentCampaigns.react';
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
    getCampaignContacts: (campaignId) => {
      dispatch(loadCampaignContacts(campaignId));
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

      return (
        <div className="panel panel-success">
          <div className="panel-heading">Connected Suppliers</div>
          <div className="panel-body">{<ConnectSupplierWidget actionUrl='' locale={this.props.locale} customerId={this.props.customerId} />}</div>
        </div>
      );
    }
  });

  LastWaveTimeline = React.createClass({
    getInitialState(){
      return {data:[
        { name: 'Week 1', opened: 66, loaded: 29, onboarded: 45 },
        { name: 'Week 2', opened: 39, loaded: 54, onboarded: 67 },
        { name: 'Week 3', opened: 15, loaded: 50, onboarded: 105 },
        { name: 'Week 4', opened: 25, loaded: 28, onboarded: 132 },
        { name: 'Week 5', opened: 22, loaded: 20, onboarded: 145 },
        { name: 'Week 6', opened: 23, loaded: 12, onboarded: 158 },
        { name: 'Week 7', opened: 23, loaded: 10, onboarded: 162 },
        { name: 'Week 8', opened: 23, loaded: 10, onboarded: 162 }
      ]};
    },
    componentDidMount(){
      var data= this.state.data;
      this.setState({data:data});
    },
    render () {
      return (
        <div className="panel panel-success">
          <div className="panel-heading">Wave 3 timeline</div>
          <div className="panel-body">
            <LineChart
              width={500}
              height={200}
              data={this.state.data}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="name"/>
              <YAxis/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip/>
              <Legend />
              <Line type="monotone" dataKey="opened" stroke="#FDBF2D" activeDot={{ r: 8 }}/>
              <Line type="monotone" dataKey="loaded" stroke="#A5A5A5" />
              <Line type="monotone" dataKey="onboarded" stroke="#EB7D3C" />
            </LineChart>
          </div>
        </div>
      );
    }
  });

  componentDidMount(){
    var me = this;
    me.props.getAllCampaigns();
    me.props.getStatuses();
  };

  componentWillReceiveProps(nextProps) {
    var me = this;
    /* FIXME: Contacts are loaded twice */
    if (!!nextProps.campaignList.campaigns
        && !me.props.campaignContactsData.campaignContacts
        && !me.props.campaignContactsData.loading) {
      _.forEach(nextProps.campaignList.campaigns, function (campaign) {
        me.props.getCampaignContacts(campaign.campaignId);
      })
    }
    this.props = nextProps;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.campaignList.loading === false;
  }

  render() {
    return (
      <div>
        <br/>
        <Row>
          <Col md={6}>
            <this.ConnectedSuppliers locale={this.context.locale} customerId={this.props.currentUserData.customerid}/>
            <this.LastWaveTimeline campaignList={this.props.campaignList} campaignContacts={this.props.campaignContactsData}/>
          </Col>
          <Col md={6}>
            <RecentCampaigns campaigns={this.props.campaignsStatus} />
            <TotalSummary campaigns={this.props.campaignsStatus} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default injectIntl(CampaignDashboard);
