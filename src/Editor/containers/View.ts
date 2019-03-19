import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { View as Component } from '../components/View';

import * as CanvasViewSelectors from '../selectors/canvasView';
import { setErrorsForBuffers, setProject, setProjectName } from '../actions/canvasView';
import { DispatchProps, OwnProps, StateProps } from '../components/View.models';

const mapStateToProps = createStructuredSelector({
  textures: CanvasViewSelectors.textures,
  buffers: CanvasViewSelectors.buffers,
  buffersOrder: CanvasViewSelectors.buffersOrder,
  outputBuffer: CanvasViewSelectors.outputBuffer,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  {
    onError: setErrorsForBuffers,
    setProject,
    setProjectName,
  },
  dispatch,
);

export default connect<StateProps, DispatchProps, OwnProps, {}>(mapStateToProps, mapDispatchToProps)(Component);
