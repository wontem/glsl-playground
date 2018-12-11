import { connect } from 'react-redux';
import { bindActionCreators, Dispatch, AnyAction } from 'redux';
import { createStructuredSelector } from 'reselect';
import { TexturesList as Component } from '../components/TexturesList';

import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';
import { DispatchProps, OwnProps, StateProps } from '../components/TexturesList.models';

const mapStateToProps = createStructuredSelector({
  textures: Selectors.textures,
  textureNames: Selectors.textureNames,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators(
  {
    createTexture: ActionCreators.createTexture,
    removeTexture: ActionCreators.removeTexture,
    updateTexture: ActionCreators.updateTexture,
  },
  dispatch,
);

export default connect<StateProps, DispatchProps, OwnProps, {}>(mapStateToProps, mapDispatchToProps)(Component);
