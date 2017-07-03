import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import _ from 'lodash';
import { connect } from 'react-redux';

import Thumbnail from '../components/common/Thumbnail.react';
import EmailTemplateDropzone from '../components/EmailTemplateDropzone.react';
import Template from '../../utils/template';

@connect(
  state => ({
    currentUserData: state.currentUserData
  })
)
export default class CampaignEmailTemplate extends Component {
  constructor(props) {
    super(props);
    this.setDefaultState(props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.type !== nextProps.type) {
      this.setDefaultState(nextProps);
    }
    this.props = nextProps;
  }

  setDefaultState = (props) => {
    this.template = new Template();
    this.templates = this.template.get(props.type);
    this.defaultTemplate = this.template.getDefaultTemplate(props.type);
    this.state = { selectedTemplate: this.defaultTemplate };
  }

  handleSelection = (templateId) => {
    this.setState({ selectedTemplate: templateId });
  }

  handleBack = () => {
    if (this.props.type === 'email') {
      this.props.router.push(`/edit/${this.props.campaignId}`);
    } else {
      this.props.router.push(`/edit/${this.props.campaignId}/template/email`);
    }
  }

  handleSave = () => {
    if (this.props.type === 'email') {
      this.props.router.push(`/edit/${this.props.campaignId}/template/onboard`);
    } else {
      this.props.router.push(`/edit/${this.props.campaignId}/contacts`);
    }
  }

  renderThubmnails = () => {
    let thumbnails = [];
    for (let t in this.templates) {
      thumbnails.push(
        <Thumbnail
          key={this.templates[t].id}
          size={this.templates[t].size}
          onSelect={this.handleSelection.bind(this, this.templates[t].id)}
          isSelected={this.state.selectedTemplate === this.templates[t].id}
          src={this.props.router.createPath(this.templates[t].thumbnail)}
        />
      );
    }
    return thumbnails;
  }

  render() {
    const { type, intl: { formatMessage } } = this.props;
    let dropzoneLogoRef, dropzoneHeaderRef;

    return (
      <div className="form-horizontal">
        <h1>{`Choose ${_.upperFirst(type)} Template`}</h1>
        <div className="row">
          <div className="col-md-8">
            <div>
              {this.renderThubmnails()}
            </div>
            <div style={{ float: 'left', paddingRight: 10 }}>
              <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} filename="logo" />
            </div>
            <div style={{ float: 'left' }}>
              <EmailTemplateDropzone customerId={this.props.currentUserData.customerid} filename="header" />
            </div>
          </div>
        </div>
        <br />
        <div className="form-submit text-right">
          <button className="btn btn-link" onClick={this.handleBack}>
            {formatMessage({ id: 'campaignEditor.steps.button.previous' })}
          </button>
          <button className="btn btn-primary">
            {formatMessage({ id: 'campaignEditor.steps.button.createTemplate' })}
          </button> &nbsp;
          <button className="btn btn-primary" onClick={this.handleSave}>
            {formatMessage({ id: 'campaignEditor.steps.button.savenext' })}
          </button>
        </div>
      </div>
    );
  }
}

CampaignEmailTemplate.propTypes = {
  type: React.PropTypes.oneOf(['email', 'onboarding']),
  router: React.PropTypes.object,
  campaignId: React.PropTypes.string.isRequired,
  intl: intlShape.isRequired
}
