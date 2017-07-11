import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { injectIntl } from 'react-intl';

const RecentCampaigns = ({intl, campaigns}) => (
    <div className="panel panel-success">
      <div className="panel-heading">{intl.formatMessage({ id: 'campaignDashboard.component.recentCampaigns'})}</div>
      <div className="panel-body">
        <BarChart width={500} height={300} data={campaigns} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip/>
          <Legend />
          <Bar stackId="a" dataKey='started' barSize={20} fill='#8884d8' name={intl.formatMessage({ id: 'campaignDashboard.statuses.started' })} />
          <Bar stackId="a" dataKey='bounced' barSize={20} fill='#459FD2' name={intl.formatMessage({ id: 'campaignDashboard.statuses.bounced' })} />
          <Bar stackId="a" dataKey='read' barSize={20} fill='#F7783A' name={intl.formatMessage({ id: 'campaignDashboard.statuses.read' })} />
          <Bar stackId="a" dataKey='loaded' barSize={20} fill='#A5A5A5' name={intl.formatMessage({ id: 'campaignDashboard.statuses.loaded' })} />
          <Bar stackId="a" dataKey='registered' barSize={20} fill='#008000' name={intl.formatMessage({ id: 'campaignDashboard.statuses.registered' })} />
          <Bar stackId="a" dataKey='serviceConfig' barSize={20} fill='#800080' name={intl.formatMessage({ id: 'campaignDashboard.statuses.serviceConfig' })} />
          <Bar stackId="a" dataKey='onboarded' barSize={20} fill='#FFBB30' name={intl.formatMessage({ id: 'campaignDashboard.statuses.onboarded' })} />
          <Bar stackId="a" dataKey='connected' barSize={20} fill='#FF1493' name={intl.formatMessage({ id: 'campaignDashboard.statuses.connected' })} />
        </BarChart>
      </div>
    </div>
  );


export default RecentCampaigns;