import { combineReducers, Reducer } from 'redux';

import { canvasView } from './canvasView';

export const rootReducer: Reducer = combineReducers({
  canvasView,
});
