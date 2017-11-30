import { Component } from 'react';
import PropTypes from 'prop-types';

const REGIONS_EVENTS = [
  'region-in',
  'region-out',
  'region-mouseenter',
  'region-mouseleave',
  'region-click',
  'region-dblclick',
  'region-updated',
  'region-update-end',
  'region-removed',
  'region-play'
];

const REGION_EVENTS = [
  'in',
  'out',
  'remove',
  'update',
  'click',
  'dbclick',
  'over',
  'leave'
];

/**
 * @description Capitalise the first letter of a string
 */
function capitaliseFirstLetter(string) {
  return string
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

class Regions extends Component {
  constructor(props) {
    super(props);

    // this is so that jscs does not force us to go functional
    this.state = {};
  }

  componentDidMount() {
    if (this.props.isReady) {
      this._init.call(this);
    }

    this.props.wavesurfer.on('ready', this._init.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    // only update if the wavesurfer instance has been ready
    if (!this.props.isReady) {
      return;
    }

    if (this.props.wavesurfer.regions && this.props.wavesurfer.regions.list) {
      Object.keys(this.props.wavesurfer.regions.list).forEach(currentKey => {
        this.props.wavesurfer.regions.list[currentKey].remove();
      });
    }

    var newRegionId = void 0;
    for (newRegionId in nextProps.regions) {
      if ({}.hasOwnProperty.call(nextProps.regions, newRegionId)) {
        var newRegion = nextProps.regions[newRegionId];
        this._hookUpRegionEvents(nextProps.wavesurfer.addRegion(newRegion));
      }
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    REGION_EVENTS.forEach(e => {
      this.props.wavesurfer.un(e);
    });
  }

  _init() {
    const { wavesurfer, regions } = this.props;
    let newRegionId;

    REGIONS_EVENTS.forEach(e => {
      const propCallback = this.props[`on${capitaliseFirstLetter(e)}`];
      if (!propCallback) return;

      wavesurfer.on(e, (...originalArgs) => {
        propCallback({
          wavesurfer,
          originalArgs
        });
      });
    });

    // add regions and hook up callbacks to region objects
    for (newRegionId in regions) {
      if ({}.hasOwnProperty.call(regions, newRegionId)) {
        this._hookUpRegionEvents(wavesurfer.addRegion(regions[newRegionId]));
      }
    }
  }

  _hookUpRegionEvents(region) {
    REGION_EVENTS.forEach(e => {
      const propCallback = this.props[
        `onSingleRegion${capitaliseFirstLetter(e)}`
      ];
      const { wavesurfer } = this.props;
      if (propCallback) {
        region.on(e, (...originalArgs) => {
          propCallback({
            wavesurfer,
            originalArgs,
            region
          });
        });
      }
    });

    region.on('remove', () => {
      REGION_EVENTS.forEach(e => {
        region.un(e);
      });
    });
  }

  render() {
    return false;
  }
}

Regions.propTypes = {
  isReady: PropTypes.bool,
  regions: PropTypes.object,
  wavesurfer: PropTypes.object
};

Regions.defaultProps = {
  regions: []
};

export default Regions;
