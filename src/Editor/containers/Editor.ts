import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Editor as Component } from '../components/Editor';

import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';
import { DispatchProps, OwnProps, StateProps } from '../components/Editor.models';

const mapStateToProps = createStructuredSelector({
  items: Selectors.items,
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators(
  {
    onChange: ActionCreators.updateBuffer,
  },
  dispatch,
);

export default connect<StateProps, DispatchProps, OwnProps, {}>(mapStateToProps, mapDispatchToProps)(Component);
