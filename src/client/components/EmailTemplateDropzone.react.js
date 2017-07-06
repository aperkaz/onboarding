import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import Dropzone from 'react-dropzone';
import request from 'superagent-bluebird-promise';


function readAsArrayBuffer (file, as) {
  if (!(file instanceof Blob)) {
    throw new TypeError('Must be a File or Blob')
  }
  return new Promise(function(resolve, reject) {
    const reader = new FileReader()
    reader.onload = function(e) { resolve(e.target.result) }
    reader.onerror = function(e) { reject('Error reading' + file.name + ': ' + e.target.result) }
    reader.readAsArrayBuffer(file);
  })
}

class EmailTemplateDropzone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploading: false,
      failed: false,
      successed: false
    }
  }

  renderUploadingMessage() {
    const { intl: { formatMessage } } = this.props;

    return <div>{formatMessage({ id: 'campaignEditor.message.info.uploadingFile' })}</div>
  }

  renderSuccess() {
    const { intl: { formatMessage } } = this.props;

    return <div style={{ color: 'green' }}>{formatMessage({ id: 'campaignEditor.message.success.uploadingFile' })}</div>
  }

  renderError() {
    const { intl: { formatMessage } } = this.props;

    return <div style={{ color: 'red' }}>{formatMessage({ id: 'campaignEditor.message.error.uploadingFile' })}</div>
  }

  render() {
    const { customerId, filename } = this.props;
    const { uploading, successed, failed } = this.state;

    return (
      <div>
        <Dropzone
          accept="image/png"
          style={{ display: 'none' }}
          ref={(node) => { this.dropzone = node; }} onDrop={(acceptedFiles) => {
            acceptedFiles.forEach(file => {
              this.setState({ failed: false, successed: false, uploading: true });

              readAsArrayBuffer(file)
              .then((buffer) => {
                request
                  .put(`/blob/api/c_${customerId}/files/public/onboarding/eInvoiceSupplierOnboarding/emailTemplates/generic/${filename}.png`)
                  .set("Content-Type", "application/octet-stream")
                  .query({
                    createMissing: true
                  })
                  .send(buffer)
                  .then(() => this.setState({ successed: true, uploading: false }))
                  .catch(() => this.setState({ failed: true, uploading: false }));
              });
            });
          }}
        />
        <button type="button" onClick={() => { this.dropzone.open() }}>
          Upload {filename}.png
        </button>
        {uploading && this.renderUploadingMessage()}
        {successed && this.renderSuccess()}
        {failed && this.renderError()}
      </div>
    )
  }
}

export default injectIntl(EmailTemplateDropzone);
