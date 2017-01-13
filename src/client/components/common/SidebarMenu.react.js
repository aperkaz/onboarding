import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';

/**
 * OpusCaputa sidebar menu
 * Parent component should be body (or at least span - otherwise height won't be 100%)
 */
const SidebarMenu = ({ menuItems, intl }) => {
  return (
    <section className="sidebar">
      <nav className="navbar navbar-default">
        <div className="nav-background" />
        <div className="navbar-header hidden-md">
          <a className="navbar-brand visible-lg" href="#">
            <img src="/campaigns/img/oc-logo-white.svg" style={{ height: '1.4em' }}/>
          </a>
        </div>
        <ul className="nav navbar-nav">
          {menuItems.map((item) => {
            return (
              <li key={item.name}>
                <a href={item.location + '/'}>
                  {intl.formatMessage({ id: `sidebar.menu.${item.name}.label` })}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
};

SidebarMenu.propTypes = {
  intl: intlShape.isRequired,
  menuItems: PropTypes.array.isRequired
};

export default injectIntl(SidebarMenu);
