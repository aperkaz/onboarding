import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Messages from './i18n';
import request from 'superagent';

class FunnelChart extends React.Component
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
        this.context.i18n.register('FunnelChart', Messages);
        this.loadData();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        nextContext.i18n && nextContext.i18n.register('FunnelChart', Messages);
        this.loadData();
    }

    loadData()
    {
        return request.get('/onboarding/api/stats/transition').set('Accept', 'application/json').end((err, res) =>
        {
            const data = res.body.map(item =>
            {
                return {
                    name: this.context.i18n.getMessage(`FunnelChart.${item.name}`),
                    value: item.value
                }
            });

            this.setState({ data: data });
        });
    }

    render()
    {
        return(
            <div className="panel panel-success">
                <div className="panel-heading">{this.context.i18n.getMessage('FunnelChart.title')}</div>
                <div className="panel-body">
                  <BarChart width={500} height={300} data={this.state.data}>
                    <XAxis dataKey="name"/>
                    <YAxis allowDecimals={false}/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend />
                    <Bar dataKey='value' fill='#8884d8' name={this.context.i18n.getMessage('FunnelChart.value')}/>
                  </BarChart>
                </div>
            </div>
        );
    }
}

export default FunnelChart;
