import React from 'react';
import Thumbnail from '../components/common/Thumbnail.react';
import { injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';

// loading from utils
import Template from '../../utils/template';

export default class CampaignEmailTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.setDefaultState(props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.type != nextProps.type) {
      this.setDefaultState(nextProps);
    }
    this.props = nextProps;
  }

  setDefaultState = (props) => {
    this.template = new Template();
    this.templates = this.template.get(props.type);
    this.defaultTemplate = this.template.getDefaultTemplate(props.type);
    this.state = {selectedTemplate: this.defaultTemplate};
  }

  handleSelection = (templateId) => {
    this.setState({selectedTemplate: templateId});
  }

  renderThubmnails = () => {
    let thumbnails = [];
    for (let t in this.templates) {
      thumbnails.push(
        <Thumbnail onSelect={this.handleSelection.bind(this, this.templates[t].id)} isSelected={this.state.selectedTemplate == this.templates[t].id}  key={this.templates[t].id} src={this.templates[t].thumbnail} />
      );
    }
    return thumbnails;
  }

  back = () => {
    if (this.props.type == 'email')
      this.props.router.push(`/campaigns/edit/${this.props.campaignId}`);
    else
      this.props.router.push(`/campaigns/edit/${this.props.campaignId}/template/email`);
  }

  save = () => {
    if (this.props.type == 'email')
      this.props.router.push(`/campaigns/edit/${this.props.campaignId}/template/onboard`);
    else
      this.props.router.push(`/campaigns/edit/${this.props.campaignId}/contacts`);
  }

  render() {
    return (
      <div className="form-horizontal">
        <h1>{`Choose ${_.upperFirst(this.props.type)} Template`}</h1>
        <div className="row">
          <div className="col-md-8">
            {this.renderThubmnails()}
          </div>
        </div>
        <br />
        <div className="form-submit text-right">
          <button className="btn btn-link" onClick={this.back}>
            {this.props.intl.formatMessage({id: 'campaignEditor.steps.button.previous'})}
          </button>
          <button className="btn btn-primary">
            {this.props.intl.formatMessage({id: 'campaignEditor.steps.button.createTemplate'})}
          </button> &nbsp;
          <button className="btn btn-primary" onClick={this.save}>
            {this.props.intl.formatMessage({id: 'campaignEditor.steps.button.savenext'})}
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
