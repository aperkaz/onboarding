import React, { Component } from 'react';

class TemplatePreview extends Component
{
    static propTypes = {
        templateId : React.PropTypes.number.isRequired,
        customerId : React.PropTypes.string.isRequired,
        height : React.PropTypes.number.isRequired
    }

    static defaultProps = {
        height : 300
    }

    constructor(props)
    {
        super(props);

        this.state = {
            templateId : this.props.templateId
        }

        this.frame = null;
    }

    componentWillReceiveProps(nextPops, nextContext)
    {
        if(nextPops.templateId != this.props.templateId)
            this.setState({ templateId : nextPops.templateId });
    }

    reload()
    {
        this.frame.contentDocument.location.reload();
    }

    render()
    {
        return(
            <div>
                <iframe className="col-sm-12 form-control" ref={node => this.frame = node} style={{ height : this.props.height }} src={`/onboarding/api/templates/${this.props.customerId}/${this.state.templateId}/preview`}></iframe>
            </div>
        )
    }
}

export default TemplatePreview;
