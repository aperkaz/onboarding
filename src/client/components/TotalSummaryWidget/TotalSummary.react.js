import React from 'react';
import _ from 'lodash';
import { Col, Panel } from 'react-bootstrap';

const sum = (campaigns, label) => campaigns.reduce( (result, value) => result + (value[label] || 0), 0);
const formatValue = (campaigns, label) => sum(campaigns, label) || '-/-';
const STATUSES = ['started', 'bounced', 'read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'connected'];

const TotalSummary = ({intl, campaigns}) => (
        <div className="panel panel-success">
          <div className="panel-heading">{intl.formatMessage({ id: 'campaignDashboard.component.totalSummary'})}</div>
          <div className="panel-body">
            {_.map(STATUSES, (status) => (
              <Col key={status} xs={3}>
                <Panel header={_.toUpper(intl.formatMessage({ id: `campaignDashboard.statuses.${status}` }))}>{formatValue(campaigns, status)}</Panel>
              </Col>
            ))}
          </div>
        </div>
      );


export default TotalSummary;