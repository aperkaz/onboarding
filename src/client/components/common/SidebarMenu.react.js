import React, {PropTypes} from 'react';
import { injectIntl, intlShape } from 'react-intl';

/**
 * OpusCaputa sidebar menu
 * Parent component should be body (or at least span - otherwise height won't be 100%)
 */
const SidebarMenu = ({intl}) => {
  return(
    <section className="sidebar">
      <nav className="navbar navbar-default">
        <div className="nav-background"></div>
        <div className="navbar-header hidden-md">
          <a className="navbar-brand visible-lg" href="#">
            <img src="../../img/oc-logo-white.svg" style={{ height: '1.4em' }}/>
          </a>
        </div>
        <ul className="nav navbar-nav">
          <li>
            <a href="#">
              {intl.formatMessage({id: 'sidebar.menu.campaigns.label'})}
            </a>
          </li>
        </ul>
        <ul className="nav navbar-nav">
          <li>
            <a href="#">
              {intl.formatMessage({id: 'sidebar.menu.suppliers.label'})}
            </a>
          </li>
        </ul>
      </nav>
    </section>
  );
};

SidebarMenu.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(SidebarMenu);
