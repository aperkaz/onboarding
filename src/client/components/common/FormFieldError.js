import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';

const FormFieldError = ({ hasError, error }) => {
  if (!hasError) return null;

  return (
    <div className="col-sm-offset-4 col-sm-8">
      <span className="label label-danger">
        <FormattedMessage id={error}/>
      </span>
    </div>
  );
};

export default injectIntl(FormFieldError);
