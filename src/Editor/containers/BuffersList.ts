import { connect } from 'react-redux';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import { createStructuredSelector } from 'reselect';
import { BuffersList as Component } from '../components/BuffersList';

import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';
import { DispatchProps, OwnProps, StateProps } from '../components/BuffersList.models';

const mapStateToProps = createStructuredSelector({
  bufferNames: Selectors.bufferNames,
  outputBuffer: Selectors.outputBuffer,
  selectedBuffer: Selectors.currentBufferName,
  buffersOrder: Selectors.buffersOrder,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators(
  {
    createBuffer: ActionCreators.createBuffer,
    selectBuffer: ActionCreators.selectBuffer,
    setOutputBuffer: ActionCreators.setOutputBuffer,
    removeBuffer: ActionCreators.removeBuffer,
  },
  dispatch,
);

export default connect<StateProps, DispatchProps, OwnProps, {}>(mapStateToProps, mapDispatchToProps)(Component);
