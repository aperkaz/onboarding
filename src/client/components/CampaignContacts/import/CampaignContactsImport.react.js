import React, { PropTypes, Component } from 'react';
import Dropzone from 'react-dropzone';
import CampaignContactImportResult from './CampaignContactImportResult.react';
import XLSX from 'xlsx';
import Papa from 'papaparse';
import _ from 'lodash';
import './contactImport.css';
import { injectIntl, intlShape } from 'react-intl';

const supportedFileExtensions = {exel: ['xls', 'xlsx'], csv: ['csv']};

class CampaignContactsImport extends Component {
  static propTypes = {
    campaignId: PropTypes.string.isRequired,
    onUploadCampaignContacts: PropTypes.func.isRequired,
    importInProgress: PropTypes.bool,
    importResult: PropTypes.object,
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      dropFilesError: false
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({dropFilesError: false});
  }

  getFileTypeCallback(files) {
    const { onUploadCampaignContacts, campaignId } = this.props;

    if (files.length > 0) {
      if(_.indexOf(supportedFileExtensions.exel, files[0].name.split('.').pop()) !== -1) {
        return (e) => {
          var workbook = XLSX.read(e.target.result, { type: 'binary' });
          onUploadCampaignContacts(campaignId, XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
        };
      } else if(_.indexOf(supportedFileExtensions.csv, files[0].name.split('.').pop()) !== -1) {
        return (e) => {
          Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: (result, file) => {
              onUploadCampaignContacts(campaignId, result.data);
            },
            error: (error, file) => {
              console.err('CSV file reading error');
            }
          })
        }
      }
    }
    return undefined;
  }

  onDrop(acceptedFiles, rejectedFiles) {
    this.setState({dropFilesError: false});
    let onFileLoadCallback = this.getFileTypeCallback(acceptedFiles);
    if(!_.isUndefined(onFileLoadCallback)) {
      let reader = new FileReader();
      reader.onload = onFileLoadCallback;
      reader.onerror = (e) => {
        console.err('Excel file reading error');
      };
      reader.readAsBinaryString(acceptedFiles[0]);
    } else {
      this.setState({dropFilesError: true});
    }
  }

  renderDropZoneMessage() {
    if (!this.props.importInProgress) {
      if(this.state.dropFilesError) {
        return(
          <span className="wrongFileExtension">
            {this.props.intl.formatMessage({id: 'campaignContactEditor.import.wrongExtension.message'})}
        </span>
        );
      } else {
        return (this.props.intl.formatMessage({id: 'campaignContactEditor.import.dropZone.message'}));
      }
    } else {
      return (
        <div>
          <div>{this.props.intl.formatMessage({id: 'campaignContactEditor.import.inProgress.message'})}</div>
          <div>
            <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
          </div>
        </div>
      );
    }
  }

  render() {
    const { importInProgress, importResult } = this.props;
    return (
      <div>
        <Dropzone className="dropzoneContainer" multiple={false} onDrop={::this.onDrop}>
          <div className="dropzoneMessage">
            {this.renderDropZoneMessage()}
          </div>
        </Dropzone>
        <CampaignContactImportResult importResult={importResult}/>
      </div>
    );
  }
}

export default injectIntl(CampaignContactsImport);
