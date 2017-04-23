import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Row, Col, Panel } from 'react-bootstrap';
import { Line, BarChart, LineChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CampaignDashboardDot from '../components/CampaignDashboardDot.react';
import _ from 'lodash';
import moment from 'moment';

import { getAllCampaigns } from '../actions/campaigns/getAll';
import { loadCampaignContacts } from '../actions/campaignContacts/load';

@connect(
  state => ({
    campaignList: state.campaignList,
    campaignContactsData: state.campaignContactList
  }),
  (dispatch) => ({
    getAllCampaigns: () => {
      dispatch(getAllCampaigns());
    },
    getCampaignContacts: (campaignId) => {
      dispatch(loadCampaignContacts(campaignId));
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
    params: PropTypes.object
  };


  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.component = {};
  }

  ConnectedSuppliers = React.createClass({
    shouldComponentUpdate(nextProps) {
      return !!(this.props.campaignList.campaigns && this.props.campaignContacts.campaignContacts);
    },
    getData() {
      var campaignStartMonths = [];
      var timeline = [0,0,0,0,0,0,0,0,0,0,0,0]; // base values for each month
      var campaigns = this.props.campaignList.campaigns;
      var contacts = this.props.campaignContacts.campaignContacts;
      var result;

      if (campaigns && contacts) {
        _.each(contacts, function (contact) {
          var createdOnMonth;
          // FIXME: we do not have createdOn parameter and we use lastStatusChange
          createdOnMonth = moment(contact.lastStatusChange).month();
          // increase months value when supplier creation occurs
          ++timeline[createdOnMonth];
        });
        _.each(campaigns, function(campaign) {
          var startsOnMonth;

          // if campaign has set up start date and it's equal to current year we save it to indicate on grapth
          if (campaign.startsOn && moment(campaign.startsOn).year() == moment().year()) {
            startsOnMonth = moment(campaign.startsOn).month();
            campaignStartMonths.push(startsOnMonth);
          }
        });
        result = timeline.map((val, idx) => ({
          month: idx + 1,
          suppliers: val,
          campaignStart: (campaignStartMonths.indexOf(idx) !== -1)
        }));
        console.log(result);
        return result;
      } else {
        return [];
      }
    },
    render () {
      return (
        <div className="panel panel-success">
          <div className="panel-heading">Connected Suppliers</div>
          <div className="panel-body">
            <LineChart
              data={this.getData()}
              width={500}
              height={300}
              margin={{ top: 5, bottom: 5, left: 0, right: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3"/>
              <Legend />
              <XAxis dataKey="month"/>
              <YAxis/>
              <Line type="monotone" dataKey="suppliers" stroke="#5E9CD3" dot={<CampaignDashboardDot />} />
            </LineChart>
          </div>
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

  RecentCampaigns = React.createClass({
    getInitialState(){
      return {data:[{ name: 'wave 1', bounced: 12, read: 20, loaded: 35, onboarded: 283 },
        { name: 'wave 2', bounced: 2, read: 47, loaded: 68, onboarded: 123 },
        { name: 'wave 3', bounced: 5, read: 23, loaded: 10, onboarded: 162 },
        { name: 'wave 4', bounced: 0, read: 0, loaded: 0, onboarded: 0 }]};
    },
    componentDidMount(){
      var data= this.state.data;
      this.setState({data:data});
    },
    render () {
      return (
        <div className="panel panel-success">
          <div className="panel-heading">Recent Campaigns</div>
          <div className="panel-body">
            <BarChart width={500} height={300} data={this.state.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <XAxis dataKey="name"/>
              <YAxis/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip/>
              <Legend />
              <Bar stackId="a" dataKey='bounced' barSize={20} fill='#459FD2'/>
              <Bar stackId="a" dataKey='read' barSize={20} fill='#F7783A'/>
              <Bar stackId="a" dataKey='loaded' barSize={20} fill='#A5A5A5'/>
              <Bar stackId="a" dataKey='onboarded' barSize={20} fill='#FFBB30'/>
            </BarChart>
          </div>
        </div>
      );
    }
  });

  TotalSummary = React.createClass({
    getInitialState(){
      return {data:[]};
    },
    componentDidMount(){
      var data= this.state.data;
      this.setState({data:data});
    },
    render () {
      return (
        <div className="panel panel-success">
          <div className="panel-heading">Total summary</div>
          <div className="panel-body">
            <Col xs={2}>
              <Panel header="New">-/-</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Bounced">19</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Sent">-/-</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Read">90</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Loaded">123</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Onboarded">568</Panel>
            </Col>
          </div>
        </div>
      );
    }
  });

  componentDidMount(){
    var me = this;
    me.props.getAllCampaigns();
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
            <this.ConnectedSuppliers campaignList={this.props.campaignList} campaignContacts={this.props.campaignContactsData}/>
            <this.LastWaveTimeline campaignList={this.props.campaignList} campaignContacts={this.props.campaignContactsData}/>
          </Col>
          <Col md={6}>
            <this.RecentCampaigns campaignList={this.props.campaignList} campaignContacts={this.props.campaignContactsData}/>
            <this.TotalSummary campaignList={this.props.campaignList} campaignContacts={this.props.campaignContactsData}/>
          </Col>
        </Row>
      </div>
    )
  }
}

export default injectIntl(CampaignDashboard);
