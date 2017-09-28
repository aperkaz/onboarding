import React, { PropTypes, Component } from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, intlShape } from 'react-intl';

class ModalDialog extends Component
{
    static propTypes = {
        visible : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        message : PropTypes.string.isRequired,
        onButtonClick : PropTypes.func.isRequired,
        buttons : PropTypes.array.isRequired,
        intl: intlShape.isRequired,
        showFooter: PropTypes.bool.isRequired,
        size: PropTypes.oneOf([null, 'small', 'large'])
    }

    static defaultProps = {
        visible : false,
        title : '',
        message : '',
        onButtonClick : () => { },
        buttons : [ 'ok', 'cancel' ],
        showFooter: true,
        size: null
    }

    constructor(props)
    {
        super(props);

        this.state = {
            visible : props.visible,
            title : props.title,
            message : props.message,
            size: props.size
        }
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState(nextProps);
    }

    renderFooter() {
        if (!this.props.showFooter) return null;

        const intl = this.props.intl;
        const buttons = this.props.buttons.map(item => item); // Make a copy.
        const primaryButton = buttons.pop();

        return (
            <Modal.Footer>
                {
                    buttons.map(button =>
                    {
                        return <button key={button} className="btn btn-link" onClick={e => this.handleEvent(button)}>{intl.formatMessage({ id: `modal.button.${button}` })}</button>
                    })
                }
                <button className="btn btn-primary" onClick={e => this.handleEvent(primaryButton)}>{intl.formatMessage({ id: `modal.button.${primaryButton}` })}</button>
            </Modal.Footer>
        );
    }

    handleEvent = (type) =>
    {
        this.setState({ visible : false });
        this.props.onButtonClick(type);
    }

    render()
    {
        const sizeProps = this.state.size ? {bsSize: this.state.size} : {};
        return(
            <Modal {...sizeProps} show={this.state.visible} keyboard={true} onHide={e => this.handleEvent('cancel')}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.message || this.props.children}
                </Modal.Body>
                {this.renderFooter()}
            </Modal>
        );
    }
}

export default injectIntl(ModalDialog);
