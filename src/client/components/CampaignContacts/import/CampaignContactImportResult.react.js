import React, { PropTypes } from 'react';
import _ from 'lodash';
import './contactImport.css';
import { injectIntl, intlShape } from 'react-intl';

const CampaignContactImportResult = ({ importResult, intl }) => {
  if (_.isEmpty(importResult)) {
    return null;
  }

  return (
    <table className="table table-striped importResultTable">
      <thead>
      <tr>
        <th>{intl.formatMessage({ id: 'campaignContactEditor.importResult.header.created' })}</th>
        <th>{intl.formatMessage({ id: 'campaignContactEditor.importResult.header.updated' })}</th>
        <th>{intl.formatMessage({ id: 'campaignContactEditor.importResult.header.failed' })}</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{importResult.created}</td>
        <td>{importResult.updated}</td>
        <td>{importResult.failed}</td>
      </tr>
      </tbody>
    </table>
  );
};

CampaignContactImportResult.propTypes = {
  importResult: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(CampaignContactImportResult);
