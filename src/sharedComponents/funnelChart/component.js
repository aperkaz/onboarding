import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import request from 'superagent';
// import _ from 'lodash';
// import { Col, Panel } from 'react-bootstrap';

class FunnelChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const component = this;
    request.get('/onboarding/api/stats/transition')
    .end(function(err, res){
      component.setState({data: res.body}) ;
    });
  }

  render() {
    return (
        <div className="panel panel-success">
            <div className="panel-heading"><h4>eTransition Pipeline</h4></div>
            <div className="panel-body">
              <BarChart width={500} height={300} data={this.state.data}>
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Bar dataKey='value' fill='#8884d8' />
              </BarChart>
            </div>
        </div>
    );
  }
}

export default FunnelChart;