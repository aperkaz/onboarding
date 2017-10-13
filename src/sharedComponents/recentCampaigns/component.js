import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import formatDataRaw from '../../utils/dataNormalization/getStatuses'
import Messages from './i18n';
import request from 'superagent';

class RecentCampaigns extends React.Component
{
    static contextTypes = {
        i18n: PropTypes.object.isRequired,
    };

    constructor(props)
    {
        super(props);
        this.state = {
            data: null
        };
    }

    componentWillMount()
    {
        this.context.i18n.register('RecentCampaigns', Messages);
        this.loadData();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        nextContext.i18n && nextContext.i18n.register('RecentCampaigns', Messages);
        this.loadData();
    }

    loadData()
    {
        return request.get('/onboarding/api/stats/campaigns').set('Accept', 'application/json').end((err, res) =>
        {
            const data = formatDataRaw(res.body);
            this.setState({ data: data });
        });
    }

    render()
    {
        return(
            <div className="panel panel-success">
        <div className="panel-heading">{this.context.i18n.getMessage('RecentCampaigns.title')}</div>
        <div className="panel-body">
          <BarChart width={500} height={300} data={this.state.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Bar stackId="a" dataKey='started' barSize={20} fill='#8884d8' name={this.context.i18n.getMessage('RecentCampaigns.started')} />
            <Bar stackId="a" dataKey='bounced' barSize={20} fill='#459FD2' name={this.context.i18n.getMessage('RecentCampaigns.bounced')} />
            <Bar stackId="a" dataKey='read' barSize={20} fill='#F7783A' name={this.context.i18n.getMessage('RecentCampaigns.read')} />
            <Bar stackId="a" dataKey='loaded' barSize={20} fill='#A5A5A5' name={this.context.i18n.getMessage('RecentCampaigns.loaded')} />
            <Bar stackId="a" dataKey='registered' barSize={20} fill='#008000' name={this.context.i18n.getMessage('RecentCampaigns.registered')} />
            <Bar stackId="a" dataKey='serviceConfig' barSize={20} fill='#800080' name={this.context.i18n.getMessage('RecentCampaigns.serviceConfig')} />
            <Bar stackId="a" dataKey='onboarded' barSize={20} fill='#FFBB30' name={this.context.i18n.getMessage('RecentCampaigns.onboarded')} />
            <Bar stackId="a" dataKey='connected' barSize={20} fill='#FF1493' name={this.context.i18n.getMessage('RecentCampaigns.connected')} />
          </BarChart>
        </div>
      </div>
        );
    }
}

export default RecentCampaigns;
