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
        onCopy : PropTypes.func.isRequired,
        onEdit : PropTypes.func.isRequired,
        allowCopy : PropTypes.func.isRequired,
        allowEdit : PropTypes.func.isRequired
    }

    static defaultProps = {
        height : 300,
        allowFullPreview : false,
        previewScale : 0.5,
        onCopy : () => null,
        onEdit : () => null,
        allowCopy : true,
        allowEdit : true
    }

    constructor(props)
    {
        super(props);

        this.state = {
            templateId : props.templateId,
            allowCopy : props.allowCopy,
            allowEdit : props.allowEdit
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

    handleOnCopy(e)
    {
        e.preventDefault();
        this.props.onCopy(this.state.templateId);
    }

    handleOnEdit(e)
    {
        e.preventDefault();
        this.props.onEdit(this.state.templateId);
    }

    render()
    {
        const { templateId, allowCopy, allowEdit } = this.state;
        const showControls = allowCopy || allowEdit;

        const outerStyle = {
            height : this.props.height + 'px',
            float : showControls ? 'left' : 'none'
        };

        const iframeStyle = {
            height : (1 / this.props.previewScale * this.props.height) + 'px',
            width : (100 / this.props.previewScale) + '%',
            marginBottom : -this.props.height + 'px',
            transform: `scale(${this.props.previewScale})`,
            transformOrigin: '0 0'
        };

        return(
            <div>
                <div style={outerStyle}>
                    {
                        this.props.customerId && !isNaN(templateId) ?
                            <iframe
                                className="col-sm-12 form-control hover-frame"
                                ref={node => this.frame = node}
                                style={iframeStyle}
                                onLoad={e => this.props.allowFullPreview && this.handleOpenPreview(e)}
                                src={`/onboarding/api/templates/${this.props.customerId}/${templateId}/preview`}>
                            </iframe>
                        : <div></div>
                    }
                </div>
                {
                    showControls ?
                    <div style={{ height : this.props.height + 'px', width : '40px', float : 'right', background : '#eee' }}>
                        {
                            allowCopy &&
                            <a href="#" style={{ fontSize : '16px', display : 'block', margin : '10px 0' }} onClick={e => this.handleOnCopy(e)}><span className="glyphicon glyphicon-duplicate"></span></a>
                        }
                        {
                            allowEdit &&
                            <a href="#" style={{ fontSize : '16px', display : 'block', margin : '10px 0' }} onClick={e => this.handleOnEdit(e)}><span className="glyphicon glyphicon-pencil"></span></a>
                        }
                    </div>
                    : <div></div>
                }
            </div>
        )
    }
}

export default TemplatePreview;
