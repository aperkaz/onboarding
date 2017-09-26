import React from 'react';
import PropTypes from 'prop-types';

class ContextComponent extends React.Component
{
    static contextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired
    }
}

export default ContextComponent;
