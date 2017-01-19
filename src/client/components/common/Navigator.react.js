import React from 'react';
import {Link} from 'react-router';

class Navigator extends React.Component {
  constructor(props) {
    super(props);
    this.liIdPrefix = 'Navigator';
  }

  componentDidMount() {
    $('.nav-tabs > li a[title]').tooltip();
    $('a[data-toggle="tab"]').on('show.bs.tab', (e) => {
      let $target = $(e.target);

      if ($target.parent().hasClass('disabled')) {
          return false;
      }
    });
    $('a[data-toggle="tab"]').on('click', (e) => {
      if (!$(e.currentTarget).parent().hasClass('disabled'))
        this.props.router.push($(e.currentTarget).attr('href'));
      e.preventDefault();
      e.stopPropagation();
    });
  }

  renderSteps = () => {
    let stepDOM = [];
    for (let step in this.props.steps) {
      stepDOM.push(
        <li id={`Navigator${step}`} key={step} role="presentation" className={step == this.props.active ? "active" : this.props.steps[step].block ? "disabled" : ""}>
          <a href={`${this.props.steps[step].url}`} data-toggle="tab" aria-controls={step} role="tab" title={this.props.steps[step].name}>
            <span className="round-tab">
              {this.props.steps[step].icon}
            </span>
          </a>
        </li>);
    }
    return stepDOM;
  }

  render() {
    return (
      <div>
        <div className="wizard">
          <div className="wizard-inner">
            <div className="connecting-line"></div>
              <ul className="nav nav-tabs" role="tablist">
                {this.renderSteps()}
              </ul>
            </div>
        </div>
        {this.props.body}
      </div>);
  }
}

Navigator.propTypes = {
  steps: React.PropTypes.object,
  active: React.PropTypes.string,
  body: React.PropTypes.element
}

export default Navigator;
