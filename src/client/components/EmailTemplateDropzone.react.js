import React, { Component } from 'react';
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
      failed: false,
      successed: false
    }
  }

  renderSuccess() {
    return <div style={{ color: 'green' }}>{this.props.filename} has been uploaded properly</div>
  }

  renderError() {
    return <div style={{ color: 'red' }}>{this.props.filename} upload fail, Please try again</div>;
  }

  render() {
    const { customerId, filename } = this.props;
    const { successed, failed } = this.state;

    return (
      <div>
        <Dropzone
          accept="image/png"
          style={{ display: 'none' }}
          ref={(node) => { this.dropzone = node; }} onDrop={(acceptedFiles, rejectedFiles) => {
          if (acceptedFiles) {
            acceptedFiles.forEach(file => {
              this.setState({ failed: false, successed: false });

              readAsArrayBuffer(file)
              .then((buffer) => {
                request
                  .put(`/blob/api/c_${customerId}/file`)
                  .set("Content-Type", "application/octet-stream")
                  .query({
                    path: `/public/onboarding/eInvoiceSupplierOnboarding/emailTemplates/generic/${filename}.png`,
                    createMissing: true
                  })
                  .send(buffer)
                  .then(() => this.setState({ successed: true }))
                  .catch(() => this.setState({ failed: true }));
              });
            });
          }
        }} />
        <button type="button" onClick={() => { this.dropzone.open() }}>
          Upload {filename}.png
        </button>
        {successed && this.renderSuccess()}
        {failed && this.renderError()}
      </div>
    )
  }
}

export default EmailTemplateDropzone;
