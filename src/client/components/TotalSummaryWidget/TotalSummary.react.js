import React from 'react';
import _ from 'lodash';
import { Col, Panel } from 'react-bootstrap';
import { injectIntl } from 'react-intl';

const sum = (campaigns, label) => campaigns.reduce( (result, value) => result + (value[label] || 0), 0);
const formatValue = (campaigns, label) => sum(campaigns, label) || '-/-';
const STATUSES = ['started', 'bounced', 'sent', 'read', 'loaded', 'onboarded'];

const TotalSummary = ({campaigns}) => (
        <div className="panel panel-success">
          <div className="panel-heading">Total summary</div>
          <div className="panel-body">
            {_.map(STATUSES, (status) => (
              <Col key={status} xs={2}>
                <Panel header={_.toUpper(status)}>{formatValue(campaigns, status)}</Panel>
              </Col>
            ))}
          </div>
        </div>
      );


export default TotalSummary;