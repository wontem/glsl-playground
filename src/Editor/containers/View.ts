import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View as Component } from '../components/View';

import * as ActionCreators from '../actions/canvasView';

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    init: ActionCreators.init,
  },
  dispatch,
);

export default connect(null, mapDispatchToProps)(Component);
