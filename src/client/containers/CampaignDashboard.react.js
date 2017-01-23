import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {ComposedChart, Line, BarChart, LineChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {Row, Col, Panel} from 'react-bootstrap';

const CustomizedDot = React.createClass({
  render () {
    const {cx, cy, stroke, payload} = this.props;
    if (payload.campaignStart === true) {
	    console.log(cx, cy)
      return (
        <svg x={cx - 50} y={cy - 50} width={100} height={100} fill="#5E9CD3" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="1"/>
        </svg>
      );
    }
    return (
              <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024">

        </svg>
    );
  }
});


export default class CampaignDashboard extends Component {

  static contextTypes = {
  };

  // charts in order: Area, pie, stack, bar+line
  // actions in order: invoice, rfq, stamp, news

  areaData=[45,328,337,580,582,670,690,703,703,712,712,715].map(function (val, idx) {
  	return {month: idx+1, suppliers: val, campaignStart: ([1,3,5].indexOf(idx) != -1)}
  });

  pieData = {
    label: 'somethingA',
    values: [{x: 'Identified', y: 3154}, {x: 'Contacted', y: 2501}, {x: 'Discusion', y: 2146}, {x: 'Won', y: 1860}]
  };

  barData = [ {name: 'wave 1', bounced: 12, read: 20, loaded: 35, onboarded: 283},
              {name: 'wave 2', bounced: 2, read: 47, loaded: 68, onboarded: 123},
              {name: 'wave 3', bounced: 5, read: 23, loaded: 10, onboarded: 162},
              {name: 'wave 4', bounced: 0, read: 0, loaded: 0, onboarded: 0}];

  lineData = [
      {name: 'Week 1', opened: 66, loaded: 29, onboarded: 45},
      {name: 'Week 2', opened: 39, loaded: 54, onboarded: 67},
      {name: 'Week 3', opened: 15, loaded: 50, onboarded: 105},
      {name: 'Week 4', opened: 25, loaded: 28, onboarded: 132},
      {name: 'Week 5', opened: 22, loaded: 20, onboarded: 145},
      {name: 'Week 6', opened: 23, loaded: 12, onboarded: 158},
      {name: 'Week 7', opened: 23, loaded: 10, onboarded: 162},
      {name: 'Week 8', opened: 23, loaded: 10, onboarded: 162}
];

  barStackedData = [
    {
    label: 'bounced',
    values: [{x: 'wave1', y: 12}, {x: 'wave2', y: 2}, {x: 'wave3', y: 5}, {x: 'wave4', y: 0}]
    },
	 {
    label: 'read',
    values: [{x: 'wave1', y: 20}, {x: 'wave2', y: 47}, {x: 'wave3', y: 10}, {x: 'wave4', y: 0}]
    },
 	{
    label: 'loaded',
    values: [{x: 'wave1', y: 35}, {x: 'wave2', y: 68}, {x: 'wave3', y: 10}, {x: 'wave4', y: 0}]
    },
	  {
    label: 'onboarded',
    values: [{x: 'wave1', y: 283}, {x: 'wave2', y: 123}, {x: 'wave3', y: 162}, {x: 'wave4', y: 0}]
    }
];

  render() {
    return (
      <div>
        <br/>
        <Row>
          <Col md={6}>
            <div className="panel panel-success">
              <div className="panel-heading">Connected Suppliers</div>
              <div className="panel-body">
                <LineChart
                  data={this.areaData}
                  width={500}
                  height={300}
                  margin={{top: 5, bottom: 5, left: 0, right: 0}}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Legend />
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Line type="monotone" dataKey="suppliers" stroke="#5E9CD3" dot={<CustomizedDot />} />
                </LineChart>
              </div>
            </div>
            <div className="panel panel-success">
              <div className="panel-heading">Wave 3 timeline</div>
              <div className="panel-body">
                <LineChart width={500} height={200} data={this.lineData}
                           margin={{top: 5, right: 0, left: 0, bottom: 5}}>
                  <XAxis dataKey="name"/>
                  <YAxis/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Tooltip/>
                  <Legend />
                  <Line type="monotone" dataKey="opened" stroke="#FDBF2D" activeDot={{r: 8}}/>
                  <Line type="monotone" dataKey="loaded" stroke="#A5A5A5" />
                  <Line type="monotone" dataKey="onboarded" stroke="#EB7D3C" />
                </LineChart>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="panel panel-success">
             <div className="panel-heading">Recent Campaigns</div>
             <div className="panel-body">
               <BarChart width={500} height={300} data={this.barData} margin={{top: 5, right: 0, left: 0, bottom: 5}}>
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
            <div className="panel panel-success">
              <div className="panel-heading">Total summary</div>
              <div className="panel-body">
                <Col xs={2}>

                  <Panel header="New">-/-</Panel>
                </Col><Col xs={2}>
                <Panel header="Bounced">19</Panel>
              </Col><Col xs={2}>
                <Panel header="Sent">-/-</Panel>
              </Col><Col xs={2}>
                <Panel header="Read">90</Panel>
              </Col><Col xs={2}>
                <Panel header="Loaded">123</Panel>
              </Col><Col xs={2}>
                <Panel header="Onboarded">568</Panel>
              </Col>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
