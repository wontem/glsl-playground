import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Editor as Component } from '../components/Editor';

import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';

const mapStateToProps = createStructuredSelector({
  name: Selectors.currentBufferName,
  source: Selectors.currentBufferSource,
  errors: Selectors.currentBufferErrors,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    onChange: ActionCreators.updateBufferRequest,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Component);
