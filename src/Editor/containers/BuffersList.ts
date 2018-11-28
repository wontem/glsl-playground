import { connect, MapDispatchToProps, MapDispatchToPropsFunction } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { BuffersList as Component } from '../components/BuffersList';

import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';

const mapStateToProps = createStructuredSelector({
  bufferNames: Selectors.bufferNames,
  outputBuffer: Selectors.outputBuffer,
  selectedBuffer: Selectors.currentBufferName,
  buffersOrder: Selectors.buffersOrder,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  {
    createBuffer: ActionCreators.createBuffer,
    selectBuffer: ActionCreators.selectBuffer,
    setOutputBuffer: ActionCreators.setOutputBuffer,
    removeBuffer: ActionCreators.removeBuffer,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Component);
