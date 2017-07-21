import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import Dropzone from 'react-dropzone';
import request from 'superagent-bluebird-promise';


function fileToBuffer(file)
{
    if(file instanceof Blob)
    {
        return new Promise(function(resolve, reject)
        {
            const reader = new FileReader();

            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject('Error reading ' + file.name + ': ' + e.target.result);
            reader.readAsArrayBuffer(file);
        });
    }

    return Promise.reject(new TypeError('Input has to be File or Blob.'));
}

class TemplateDropzone extends Component
{
    static propTypes = {
        customerId: React.PropTypes.string.isRequired,
        campaignType: React.PropTypes.string.isRequired,
        templateType: React.PropTypes.string.isRequired,
        templateName: React.PropTypes.string.isRequired,
        filename: React.PropTypes.string.isRequired,
        onSuccess: React.PropTypes.func,
        onFailure: React.PropTypes.func
    };

    static contextTypes = {
       showNotification : React.PropTypes.func.isRequired,
       hideNotification : React.PropTypes.func.isRequired
    }

    constructor(props)
    {
        super(props);
    }

    uploadFile = (acceptedFiles) =>
    {
        const uploadMessage = this.context.showNotification('campaignEditor.message.info.uploadingFile')

        const file = acceptedFiles.shift();

        fileToBuffer(file).then(buffer =>
        {
            const endpoint = `/blob/api/c_${this.props.customerId}/files/public/onboarding/${this.props.campaignType}/${this.props.templateType}Templates/${this.props.templateName}/${this.props.filename}.png`;

            return request.put(endpoint)
                .set('Content-Type', 'application/octet-stream')
                .query({ createMissing: true })
                .send(buffer)
                .then(() =>
                {
                    this.context.hideNotification(uploadMessage);
                    this.context.showNotification('campaignEditor.message.success.uploadingFile', 'success');
                    this.props.onSuccess && this.props.onSuccess();
                })
                .catch((e) =>
                {
                    this.context.hideNotification(uploadMessage);
                    this.context.showNotification('campaignEditor.message.error.uploadingFile', 'error');
                    this.props.onSuccess && this.props.onFailure();
                });
        });
      }

    render()
    {
        const { intl } = this.props;

        return(
            <div>
                <Dropzone accept="image/png" style={{ display: 'none' }} ref={(node) => { this.dropzone = node }} onDrop={ this.uploadFile } />
                <button type="button" onClick={() => { this.dropzone.open() }}>
                    Upload {this.props.filename}.png
                </button>
            </div>
        )
    }
}

export default injectIntl(TemplateDropzone);
