import * as reselect from 'reselect';
import * as monaco from 'monaco-editor';
import { State } from '../reducers/canvasView';
import { Item } from '../components/Editor.models';

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

export const items = reselect.createSelector(
  [buffersOrder, buffers, errors, currentBufferName],
  (buffersOrder, buffers, errors, currentBufferName): Item[] => {
    return (buffersOrder || []).map((name) => {
      const source = buffers[name];
      const markers = (errors[name] || []).map((log) => {
        return {
          severity: monaco.MarkerSeverity.Error,
          message: `${log.item}: ${log.message}`,
          startLineNumber: log.line,
          endLineNumber: log.line,
          startColumn: 0,
          endColumn: Infinity,
        };
      });

      return {
        name,
        source,
        markers,
        isActive: currentBufferName === name,
      };
    });
  }
);
