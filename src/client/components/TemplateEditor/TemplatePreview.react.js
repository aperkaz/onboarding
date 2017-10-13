import React from 'react';
import PropTypes from 'prop-types';
import { ContextComponent } from '../common';

class TemplatePreview extends ContextComponent
{
    static PropTypes = {
        templateId : PropTypes.number.isRequired,
        customerId : PropTypes.string.isRequired,
        height : PropTypes.number.isRequired,
        allowFullPreview : PropTypes.bool.isRequired,
        previewScale : PropTypes.number.isRequired,
    }

    static defaultProps = {
        height : 300,
        allowFullPreview : false,
        previewScale : 0.5
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
        const nextState = { };
        let updateState = false;

        for(let key in nextPops)
        {
            if(this.props[key] != nextPops[key])
            {
                nextState[key] = nextPops[key];
                updateState = true;
            }
        }

        if(updateState)
            this.setState(nextState);
    }

    reload()
    {
        this.frame && this.frame.contentDocument.location.reload();
    }

    handleOpenPreview(e)
    {
        e.target.contentWindow.document.body.style.cursor = 'pointer';
        e.target.contentWindow.document.body.onclick = (e) =>
        {
            e.preventDefault();

            const win = window.open(`/onboarding/api/templates/${this.props.customerId}/${this.state.templateId}/preview`, '_blank');

            win.focus();
        }
    }

    render()
    {
        const { templateId } = this.state;

        const style = {
            height : (1 / this.props.previewScale * this.props.height) + 'px',
            width : (100 / this.props.previewScale) + '%',
            marginBottom : -this.props.height + 'px',
            transform: `scale(${this.props.previewScale})`,
            transformOrigin: '0 0'
        };

        return(
            <div style={{height : this.props.height + 'px'}}>
                {
                    this.props.customerId && !isNaN(templateId) ?
                        <iframe className="col-sm-12 form-control hover-frame"
                            ref={node => this.frame = node}
                            style={style}
                            onLoad={e => this.props.allowFullPreview && this.handleOpenPreview(e)}
                            src={`/onboarding/api/templates/${this.props.customerId}/${templateId}/preview`}>
                        </iframe>
                    : <div></div>
                }
            </div>
        )
    }
}

export default TemplatePreview;
