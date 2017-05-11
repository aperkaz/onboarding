import React from 'react';
import { Col, Panel } from 'react-bootstrap';

const TotalSummary = ({campaigns}) => {
    const sum = label => campaigns.reduce( (result, value) => result + value[label], 0);
    const formatValue = label => sum(label) || '-/-';
      return (
        <div className="panel panel-success">
          <div className="panel-heading">Total summary</div>
          <div className="panel-body">
            <Col xs={2}>
              <Panel header="New">{formatValue('new')}</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Bounced">{formatValue('bounced')}</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Sent">{formatValue('sent')}</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Read">{formatValue('read')}</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Loaded">{formatValue('loaded')}</Panel>
            </Col>
            <Col xs={2}>
              <Panel header="Onboarded">{formatValue('onboarded')}</Panel>
            </Col>
          </div>
        </div>
      );
    }


export default TotalSummary;