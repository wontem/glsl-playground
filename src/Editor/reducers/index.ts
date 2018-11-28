import { combineReducers, Reducer } from 'redux';

import { canvasView } from './canvasView';
import { animation } from './animation';

export const rootReducer: Reducer = combineReducers({
  canvasView,
  animation,
});
