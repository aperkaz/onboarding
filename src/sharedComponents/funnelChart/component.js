import React from 'react';
import ReactHighcharts from 'react-highcharts';
// import _ from 'lodash';
// import { Col, Panel } from 'react-bootstrap';

let funnelConfig = {
    chart: {
      type: 'funnel',
      marginRight: 100,
      height: 300
    },
    title: null,
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b> ({point.y:,.0f})',
          color: {
            colors: ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
              '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: {
              backgroundColor: null,
              style: {
                fontFamily: 'Dosis, sans-serif'
              }
            },
            title: {
              style: {
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }
            },
            tooltip: {
              borderWidth: 0,
              backgroundColor: 'rgba(219,219,216,0.8)',
              shadow: false
            },
            legend: {
              itemStyle: {
                fontWeight: 'bold',
                fontSize: '13px'
              }
            },
            xAxis: {
              gridLineWidth: 1,
              labels: {
                style: {
                  fontSize: '12px'
                }
              }
            },
            yAxis: {
              minorTickInterval: 'auto',
              title: {
                style: {
                  textTransform: 'uppercase'
                }
              },
              labels: {
                style: {
                  fontSize: '12px'
                }
              }
            },
            plotOptions: {
              candlestick: {
                lineColor: '#404048'
              }
            },


            // General
            background2: '#F0F0EA'

          },
          softConnector: true
        },
        neckWidth: '0%',
        neckHeight: '0%'

      }
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Unique users',
      data: [
        ['Identified', 3154],
        ['Contacted', 2501],
        ['Discussion', 2146],
        ['Won', 1860]
      ]
    }]
  };

class FunnelChart extends React.Component {
  render() {
    return (
        <div className="panel panel-success">
            <div className="panel-heading"><h4>eTransition Pipeline</h4></div>
            <div className="panel-body">
                <ReactHighcharts config={funnelConfig} />
            </div>
        </div>
    );
  }
}

export default FunnelChart;