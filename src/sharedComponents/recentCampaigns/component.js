import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import formatDataRaw from '../../utils/dataNormalization/getStatuses'
import Messages from './i18n';
import request from 'superagent';

class RecentCampaigns  extends React.Component {
  static contextTypes = {
    i18n : React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {data: null};
  }

  componentWillMount() {
    const component = this;
    this.context.i18n.register('RecentCampaigns', Messages);
    request.get('/onboarding/api/stats/campaigns').set('Accept', 'application/json').end(function(err, res) {
      const data = formatDataRaw(res);
      component.setState({data: data});
    });
  }

  render() {
    return (
      <div className="panel panel-success">
        <div className="panel-heading">{this.context.i18n.getMessage({ id: 'campaignDashboard.component.recentCampaigns'})}</div>
        <div className="panel-body">
          <BarChart width={500} height={300} data={campaigns} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Bar stackId="a" dataKey='started' barSize={20} fill='#8884d8' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.started' })} />
            <Bar stackId="a" dataKey='bounced' barSize={20} fill='#459FD2' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.bounced' })} />
            <Bar stackId="a" dataKey='read' barSize={20} fill='#F7783A' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.read' })} />
            <Bar stackId="a" dataKey='loaded' barSize={20} fill='#A5A5A5' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.loaded' })} />
            <Bar stackId="a" dataKey='registered' barSize={20} fill='#008000' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.registered' })} />
            <Bar stackId="a" dataKey='serviceConfig' barSize={20} fill='#800080' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.serviceConfig' })} />
            <Bar stackId="a" dataKey='onboarded' barSize={20} fill='#FFBB30' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.onboarded' })} />
            <Bar stackId="a" dataKey='connected' barSize={20} fill='#FF1493' name={this.context.i18n.getMessage({ id: 'campaignDashboard.statuses.connected' })} />
          </BarChart>
        </div>
      </div>
    );
  }
}

export default RecentCampaigns;