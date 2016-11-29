import React, { PropTypes, Component } from 'react';
import Dropzone from 'react-dropzone';
import XLSX from 'xlsx';
import _ from 'lodash';
import './contactImport.css';

export default class CampaignContactsImport extends Component {
  static propTypes = {
    campaignId: PropTypes.string.isRequired,
    onUploadCampaignContactsExcel: PropTypes.func.isRequired,
    importInProgress: PropTypes.bool,
    importResult: PropTypes.object,
  };

  onDrop(acceptedFiles, rejectedFiles) {
    const {onUploadCampaignContactsExcel, campaignId} = this.props;
    let reader = new FileReader();
    reader.onload = (e) => {
      var workbook = XLSX.read(e.target.result, { type: 'binary' });
      onUploadCampaignContactsExcel(campaignId, XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
    };
    reader.onerror = (e) => {
      console.log('Excel file reading error');
    };
    reader.readAsBinaryString(acceptedFiles[0]);
  }

  renderDropZoneMessage() {
    if(!this.props.importInProgress) {
      return('Try dropping some files here, or click to select files to upload.');
    } else {
      return(
        <div>
          <div>Importing data...</div>
          <div>
            <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
          </div>
        </div>
      );
    }
  }

  renderImportResult() {
    const {importResult} = this.props;
    if(!_.isEmpty(this.props.importResult)){
      return(
        <table className="table table-striped importResultTable">
          <thead>
            <tr>
              <th>Created</th>
              <th>Updated</th>
              <th>Failed</th>
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
    }

    return null;
  }



  render() {
    const {importInProgress} = this.props;
    return (
      <div>
        <Dropzone className="dropzoneContainer" multiple={false} onDrop={::this.onDrop}>
          <div className="dropzoneMessage">
            {this.renderDropZoneMessage()}
          </div>
        </Dropzone>
        {this.renderImportResult()}
      </div>

    );
  }
}
