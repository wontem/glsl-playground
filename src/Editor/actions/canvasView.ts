import { createAction } from 'redux-actions';

import { ActionTypes } from '../actionTypes/canvasView';
import { BufferInfo } from '../reducers/canvasView';

export const init = createAction(ActionTypes.INIT, (context: WebGL2RenderingContext) => context);
export const createBuffer = createAction(ActionTypes.CREATE_BUFFER);
export const selectBuffer = createAction(ActionTypes.SELECT_BUFFER, (name: string) => name);
export const removeBuffer = createAction(ActionTypes.REMOVE_BUFFER, (name: string) => name);
export const setOutputBuffer = createAction(ActionTypes.SET_OUTPUT_BUFFER, (name: string) => name);
export const createTexture = createAction(ActionTypes.CREATE_TEXTURE);
export const updateTexture = createAction(ActionTypes.UPDATE_TEXTURE);

export const updateBuffer = createAction(ActionTypes.UPDATE_BUFFER, (bufferInfo: BufferInfo) => bufferInfo);
export const updateBufferRequest = createAction(ActionTypes.UPDATE_BUFFER_REQUEST, (name: string, source: string) => ({ name, source }));
export const setBuffers = createAction(ActionTypes.SET_BUFFERS, (bufferInfos: Record<string, BufferInfo>) => bufferInfos);
export const setBuffersOrder = createAction(ActionTypes.SET_BUFFERS_ORDER, (buffersOrder: string[]) => buffersOrder);
