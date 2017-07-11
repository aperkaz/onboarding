import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import request from 'superagent';
import { injectIntl } from 'react-intl';

class FunnelChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const component = this;
    request.get('/onboarding/api/stats/transition')
    .end(function(err, res){
      const { intl } = component.props;
      const data = res.body.map((item) => {
        return {
          name: intl.formatMessage({id: `campaignDashboard.pipeline.${item.name}`}), 
          value: item.value 
        }
      });
      component.setState({data: data});
    });
  }

  render() {
    return (
        <div className="panel panel-success">
            <div className="panel-heading">{this.props.intl.formatMessage({ id: 'campaignDashboard.component.eTransitionPipeline'})}</div>
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

export default injectIntl(FunnelChart);