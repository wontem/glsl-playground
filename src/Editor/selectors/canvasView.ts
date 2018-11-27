// import * as reselect from 'reselect';
import { State } from '../reducers/canvasView';

const canvasView = (state): State => state.canvasView;

export const buffers = state => canvasView(state).buffers;
export const buffersOrder = state => canvasView(state).buffersOrder;
export const currentBufferName = state => canvasView(state).currentBuffer;
export const outputBuffer = state => canvasView(state).outputBuffer;

export const bufferNames = state => {
  const buffersList = buffers(state);

  return Object.keys(buffersList);
}

export const bufferSelectorCreator = (bufferName: string) => {
  return (state) => {
    const buffersList = buffers(state);

    if (bufferName in buffersList) {
      return buffersList[bufferName];
    }

    return null;
  };
}

export const currentBuffer = (state) => {
  const bufferName = currentBufferName(state);

  return bufferSelectorCreator(bufferName)(state);
}

export const currentBufferSource = (state) => {
  const buffer = currentBuffer(state);

  return buffer ? buffer.source : '';
}

export const currentBufferErrors = (state) => {
  const buffer = currentBuffer(state);

  return buffer ? buffer.errors : [];
}
