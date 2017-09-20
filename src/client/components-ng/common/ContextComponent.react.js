import React from 'react';
import PropTypes from 'prop-types';

class ContextComponent extends React.Component
{
    static contextTypes = {
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired
    }
}

export default ContextComponent;
