import React, { PropTypes, Component } from 'react';
import { Modal } from 'react-bootstrap';
import { injectIntl, intlShape } from 'react-intl';

class ModalDialog extends Component
{
    static propTypes = {
        visible : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        message : PropTypes.string.isRequired,
        size : React.PropTypes.oneOf([0, 'small', 'large']),
        onButtonClick : PropTypes.func.isRequired,
        buttons : PropTypes.array.isRequired,
        intl: intlShape.isRequired,
        showFooter: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        visible : false,
        title : '',
        message : '',
        size : 0,
        onButtonClick : () => { },
        buttons : [ 'ok', 'cancel' ],
        showFooter: true
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
        this.setState(nextProps);
    }

    handleEvent = (type) =>
    {
        this.setState({ visible : false });
        this.props.onButtonClick(type);
    }

    show()
    {
        this.setState({ visible : true });
    }

    hide()
    {
        this.setState({ visible : false });
    }

    render()
    {
        const intl = this.props.intl;
        const buttons = this.props.buttons.map(item => item); // Make a copy.
        const primaryButton = buttons.pop();

        return(
            <Modal show={this.state.visible} {...this.props.size && {bsSize : this.props.size}} keyboard={true} onHide={e => this.handleEvent('cancel')}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.message || this.props.children}
                </Modal.Body>
                {
                    this.props.showFooter &&
                        <Modal.Footer>
                            {
                                buttons.map(button =>
                                {
                                    return <button key={button} className="btn btn-link" onClick={e => this.handleEvent(button)}>{intl.formatMessage({ id: `modal.button.${button}` })}</button>
                                })
                            }
                            <button className="btn btn-primary" onClick={e => this.handleEvent(primaryButton)}>{intl.formatMessage({ id: `modal.button.${primaryButton}` })}</button>
                        </Modal.Footer>
                }
            </Modal>
        );
    }
}

export default injectIntl(ModalDialog);
