import React from 'react';
import connect from 'react-redux/lib/components/connect';

class HeaderMenu extends React.Component {
  static propTypes = {
    currentUserInfo: React.PropTypes.object,
    activeMainMenuName: React.PropTypes.string,
    activeSubMenuName: React.PropTypes.string,
    showHideDropdown: React.PropTypes.string
  };

  static defaultProps = {
    activeMainMenuName: 'Home',
    showHideDropdown: "dropdown",
    activeSubMenuName: null
  };

  constructor(props) {
    super(props);

    this.state = {
      oldOpenMenuName: null,
      currentOpenMenuName: null,
      showHideDropdown: "dropdown",
      activeMainMenuName: this.props.activeMainMenuName,
      activeSubMenuName: this.props.activeSubMenuName
    };
  }

  toggleDropDown() {
    let css = (this.state.showHideDropdown === "dropdown open") ? "dropdown" : "dropdown open";
    this.setState({ "showHideDropdown": css });
  }

  render() {
    return (
      <div className="navbar navbar-default navbar-main-menu" style={{ paddingRight: '25px' }}>
        <div className="navbar-header pull-right">
          <form className="navbar-form navbar-right">
            <div className="form-group">
              <input type="text" className="form-control" placeholder="Search"/>
            </div>
            <button type="submit" className="btn btn-default">
              <span className="glyphicon glyphicon-search" />
            </button>
          </form>
          <ul className="nav navbar-nav navbar-no-collapse navbar-right">
            <li className={this.state.showHideDropdown}>
              <a
                className="dropdown-toggle hidden-sm hidden-xs"
                onClick={this.toggleDropDown.bind(this)}
                dataToggle="dropdown"
                href="#"
              >
                john.doe@ncc.com
                <b className="caret" />
              </a>
              <a className="dropdown-toggle icon-nav-item visible-sm visible-xs" dataToggle="dropdown" href="#">
                <span className="glyphicon glyphicon-user" />
              </a>
              <ul className="dropdown-menu">
                <li className="dropdown-header hidden">
                  Language
                </li>
                <li className="divider" />
                <li>
                  <a className="hidden" href="#">Change Assignment</a>
                </li>
                <li>
                  <a href="/logout">Logout</a>
                </li>
              </ul>
            </li>
            <li className="dropdown">
              <a className="dropdown-toggle hidden-sm hidden-xs" dataToggle="dropdown" href="#">
                NCC Svenska AB
              </a>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}

function injectState(store) {
  return {
    currentUserInfo: store.currentUserInfo
  };
}

export default connect(injectState)(HeaderMenu);
