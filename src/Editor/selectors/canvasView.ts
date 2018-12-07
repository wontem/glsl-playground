// import * as reselect from 'reselect';
import { State } from '../reducers/canvasView';

const canvasView = (state: any): State => state.canvasView;

export const buffers = (state: any) => canvasView(state).buffers;
export const textures = (state: any) => canvasView(state).textures;
export const buffersOrder = (state: any) => canvasView(state).buffersOrder;
export const currentBufferName = (state: any) => canvasView(state).currentBuffer;
export const outputBuffer = (state: any) => canvasView(state).outputBuffer;
export const errors = (state: any) => canvasView(state).errors;

export const bufferNames = (state: any) => {
  const buffersList = buffers(state);

  return Object.keys(buffersList);
}

export const textureNames = (state: any) => {
  const texturesList = textures(state);

  return Object.keys(texturesList);
}

export const bufferSelectorCreator = (bufferName: string) => {
  return (state: any) => {
    const buffersList = buffers(state);

    if (bufferName in buffersList) {
      return buffersList[bufferName];
    }

    return null;
  };
}

export const currentBuffer = (state: any) => {
  const bufferName = currentBufferName(state);

  return bufferSelectorCreator(bufferName)(state);
}

export const currentBufferSource = (state: any) => {
  const buffer = currentBuffer(state);

  return buffer || '';
}

export const currentBufferErrors = (state: any) => {
  const name = currentBufferName(state);
  const allErrors = errors(state);

  return allErrors[name] || [];
}
