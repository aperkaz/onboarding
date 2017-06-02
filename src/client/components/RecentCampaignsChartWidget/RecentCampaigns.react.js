import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RecentCampaigns = ({campaigns}) => (
        <div className="panel panel-success">
          <div className="panel-heading">Recent Campaigns</div>
          <div className="panel-body">
            <BarChart width={500} height={300} data={campaigns} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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


export default RecentCampaigns;