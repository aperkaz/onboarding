import React from 'react';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import crypto from 'crypto';
import equal from 'deep-equal';

class ContextComponent extends React.Component
{
    static contextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired
    }

    getComponentId()
    {
        if(!this.componentId)
        {
            const location = this.context.router.location;
            const key = location.basename + location.pathname + this.constructor.name + Math.random();
            const hash = crypto.createHash('md5').update(key).digest('hex');

            this.componentId = hash.substr(0, 5) + hash.substr(-5);
        }

        return this.componentId;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext)
    {
        return !equal(this.props, nextProps)
            || !equal(this.state, nextState)
            || nextContext != this.context;
    }
}

export default ContextComponent;
