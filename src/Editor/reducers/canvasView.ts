import { handleActions } from 'redux-actions';

import { ActionTypes } from '../actionTypes/canvasView';
import * as ActionCreators from '../actions/canvasView';
import { parseLogs } from '../../View/utils/parseLogs';

export interface State {
  buffers: Record<string, string>;
  currentBuffer: string;
  outputBuffer: string;
  buffersOrder: string[];
  errors: Record<string, ReturnType<typeof parseLogs>>;
}

const initialState: State = {
  buffers: {},
  buffersOrder: [],
  currentBuffer: '',
  outputBuffer: '',
  errors: {},
};

export const canvasView = handleActions<State, any>(
  {
    [ActionTypes.SET_BUFFERS]: (state, action: ReturnType<typeof ActionCreators.setBuffers>): State => {
      return {
        ...state,
        buffers: action.payload,
      };
    },
    [ActionTypes.SELECT_BUFFER]: (state, action: ReturnType<typeof ActionCreators.selectBuffer>): State => {
      return {
        ...state,
        currentBuffer: action.payload,
      };
    },
    [ActionTypes.SET_OUTPUT_BUFFER]: (state, action: ReturnType<typeof ActionCreators.setOutputBuffer>): State => {
      return {
        ...state,
        outputBuffer: action.payload,
      };
    },
    [ActionTypes.SET_BUFFERS_ORDER]: (state, action: ReturnType<typeof ActionCreators.setBuffersOrder>): State => {
      return {
        ...state,
        buffersOrder: action.payload,
      };
    },
    [ActionTypes.SET_ERRORS]: (state, action: ReturnType<typeof ActionCreators.setErrors>): State => {
      return {
        ...state,
        errors: action.payload,
      };
    },
  },
  initialState,
);
