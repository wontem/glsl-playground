import { Reducer } from 'redux';

import { handleActions } from 'redux-actions';
import { ActionTypes } from '../actionTypes/canvasView';
import * as ActionCreators from '../actions/canvasView';
import { parseLogs } from '../../View/utils/parseLogs';

export interface BufferInfo {
  source: string;
  name: string;
  errors: ReturnType<typeof parseLogs>;
}

export interface State {
  buffers: Record<string, BufferInfo>;
  currentBuffer: string;
  outputBuffer: string;
  buffersOrder: string[];
}

const initialState: State = {
  buffers: {},
  buffersOrder: [],
  currentBuffer: '',
  outputBuffer: '',
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
    [ActionTypes.UPDATE_BUFFER]: (state, action: ReturnType<typeof ActionCreators.updateBuffer>): State => {
      const bufferInfo = action.payload;

      return {
        ...state,
        buffers: {
          ...state.buffers,
          [bufferInfo.name]: bufferInfo,
        },
      };
    },
  },
  initialState,
);
