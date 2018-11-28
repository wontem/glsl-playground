import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { View as Component } from '../components/View';

import { init } from '../actions/canvasView';
import { toggleAnimation, resetAnimation } from '../actions/animation';
import * as Selectors from '../selectors/animation';

const mapStateToProps = createStructuredSelector({
  isPlaying: Selectors.isPlaying,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  {
    init,
    toggleAnimation,
    resetAnimation,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Component);
