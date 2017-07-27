import React, { PropTypes, Component } from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, intlShape } from 'react-intl';

class ModalDialog extends Component
{
    static propTypes = {
        visible : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        message : PropTypes.string.isRequired,
        onConfirm : PropTypes.func.isRequired,
        onCancel : PropTypes.func.isRequired,
        buttons : PropTypes.array.isRequired,
        intl: intlShape.isRequired
    }

    static defaultProps = {
        visible : false,
        title : '',
        message : '',
        onConfirm : () => { },
        onCancel : () => { },
        buttons : [ 'ok', 'cancel' ]
    }

    constructor(props)
    {
        super(props);

        this.state = {
            visible : props.visible,
            title : props.title,
            message : props.message
        }
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.visible != this.props.visible)
            this.setState({ visible : nextProps.visible });
        if(nextProps.title != this.props.title)
            this.setState({ title : nextProps.title });
        if(nextProps.message != this.props.message)
            this.setState({ message : nextProps.message });
    }

    handleClose = (type) =>
    {
        this.setState({ visible : false });
        this.props.onCancel(type);
    }

    handleConfirm = (type) =>
    {
        this.setState({ visible : false });
        this.props.onConfirm(type);
    }

    render()
    {
        const intl = this.props.intl;

        return(
            <Modal show={this.state.visible} keyboard={true} onHide={e => this.handleClose('cancel')}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.message}
                </Modal.Body>
                <Modal.Footer>
                    {
                        this.props.buttons.indexOf('cancel') > -1 &&
                            <button className="btn btn-link" onClick={e => this.handleClose('cancel')}>{intl.formatMessage({ id: 'modal.button.cancel' })}</button>
                    }
                    {
                        this.props.buttons.indexOf('no') > -1 &&
                            <button className="btn btn-link" onClick={e => this.handleClose('no')}>{intl.formatMessage({ id: 'modal.button.no' })}</button>
                    }
                    {
                        this.props.buttons.indexOf('ok') > -1 &&
                            <button className="btn btn-primary" onClick={e => this.handleConfirm('ok')}>{intl.formatMessage({ id: 'modal.button.ok' })}</button>
                    }
                    {
                        this.props.buttons.indexOf('yes') > -1 &&
                            <button className="btn btn-primary" onClick={e => this.handleConfirm('yes')}>{intl.formatMessage({ id: 'modal.button.yes' })}</button>
                    }

                </Modal.Footer>
            </Modal>
        );
    }
}

export default injectIntl(ModalDialog);
