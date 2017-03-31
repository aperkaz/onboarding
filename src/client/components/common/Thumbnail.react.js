import React from 'react';

class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  handleSelection = () => {
    if (this.props.onSelect) {
      this.props.onSelect();
    }
  }

  render() {
    return (
      <div style={{
        float: 'left',
        marginLeft: '5px',
        marginRight: '10px',
        cursor: 'pointer'
      }} className="clearfix" onClick={this.handleSelection}
      >
        <img src={this.props.src} style = {{
          width: this.props.size && this.props.size.w ? this.props.size.w + 'px' : '150px',
          height: this.props.size && this.props.size.h ? this.props.size.h + 'px' : '150px',
          background: '#000',
          border: this.props.isSelected ? '3px solid #ee7700' : '1px solid #6d6c6a'
        }} onClick={this.handleSelection}
        />
      </div>
    );
  }
}

Thumbnail.propTypes = {
  src: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func,
  isSelected: React.PropTypes.bool,
  size: React.PropTypes.object
}

export default Thumbnail;
