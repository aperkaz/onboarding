import React from 'react';
import { connect } from 'react-redux';
import CampaignContactSelector from '../../selectors/CampaignContactSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class RecentCampaigns extends React.Component {
    constructor(props){
        super();
        this.state = {
            data:[
                    { name: 'wave 1', bounced: 12, read: 20, loaded: 35, onboarded: 283 },
                    { name: 'wave 2', bounced: 2, read: 47, loaded: 68, onboarded: 123 },
                    { name: 'wave 3', bounced: 5, read: 23, loaded: 10, onboarded: 162 },
                    { name: 'wave 4', bounced: 0, read: 0, loaded: 0, onboarded: 0 }
                ]
        };
    }
    componentDidMount(){
      var data= this.state.data;
      this.setState({data:data});
    }

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
  }

const mapStateToProps = state => {
    return {
        data: CampaignContactSelector(state)
    };
};


export default connect(mapStateToProps)(RecentCampaigns);