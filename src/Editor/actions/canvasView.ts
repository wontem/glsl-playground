import { AnyAction } from 'redux';
import { createAction } from 'redux-actions';
import { ThunkAction } from 'redux-thunk';

import { getFragmentShaderSource } from '../../View/defaultShaders';
import kekShader from '../../../kek.glsl';

import { ActionTypes } from '../actionTypes/canvasView';
import * as Selectors from '../selectors/canvasView';
import { UpdateError, Texture } from '../components/GLSLView';
import { ViewEventType } from '../../View/models';
import { parseLogs } from '../../View/utils/parseLogs';

export const setOutputBuffer = createAction(ActionTypes.SET_OUTPUT_BUFFER, (name: string) => name);
export const selectBuffer = createAction(ActionTypes.SELECT_BUFFER, (name: string) => name);
export const setBuffers = createAction(ActionTypes.SET_BUFFERS, (buffers: Record<string, string>) => buffers);
export const setTextures = createAction(ActionTypes.SET_TEXTURES, (textures: Record<string, Texture>) => textures);
export const setBuffersOrder = createAction(ActionTypes.SET_BUFFERS_ORDER, (buffersOrder: string[]) => buffersOrder);
export const setErrors = createAction(ActionTypes.SET_ERRORS, (errors: Record<string, ReturnType<typeof parseLogs>>) => errors);

type ThunkResult<A extends AnyAction = AnyAction> = ThunkAction<void, any, undefined, A>;

export const setErrorsForBuffer = (
  name: string,
  newBufferErrors: ReturnType<typeof parseLogs>,
): ThunkResult => (dispatch, getState) => {
  const { [name]: bufferErrors, ...errors } = Selectors.errors(getState());

  if (errors.length) {
    dispatch(setErrors({
      ...errors,
      [name]: newBufferErrors,
    }));
  } else {
    dispatch(setErrors(errors));
  }
}

export const setErrorsForBuffers = (
  updateError: UpdateError[],
): ThunkResult => (dispatch, getState) => {
  const errors = Selectors.errors(getState());
  const newErrors: Record<string, ReturnType<typeof parseLogs>> = {};

  updateError.forEach(({ name, error }) => {
    if (error.type === ViewEventType.CREATE_SHADER) {
      const logs = parseLogs(error.message);
      newErrors[name] = [...(newErrors[name] || []), ...logs];
    }
  });

  dispatch(setErrors({
    ...errors,
    ...newErrors,
  }));
};

export const updateBuffer = (
  name: string,
  source: string,
): ThunkResult<ReturnType<typeof setBuffers>> => (dispatch, getState) => {
  if (!name) {
    return;
  }

  const buffers = Selectors.buffers(getState());

  dispatch(setErrorsForBuffer(name, []));
  dispatch(setBuffers({...buffers, [name]: source}));
};

export const removeBuffer = (
  name: string,
): ThunkResult => (dispatch, getState) => {
  const state = getState();
  const {[name]: deletedBuffer, ...buffers} = Selectors.buffers(state);
  const newOrder = Selectors.buffersOrder(getState()).filter(v => v !== name);
  const bufferToSelect = newOrder.length ? newOrder[newOrder.length - 1] : '';

  if (name === Selectors.outputBuffer(state)) {
    dispatch(setOutputBuffer(bufferToSelect));
  }

  if (name === Selectors.currentBufferName(state)) {
    dispatch(selectBuffer(bufferToSelect));
  }

  dispatch(setBuffersOrder(newOrder));
  dispatch(setErrorsForBuffer(name, []));
  dispatch(setBuffers(buffers));
};

export const createBuffer = (): ThunkResult => (dispatch, getState) => {
  const bufferNames = Selectors.bufferNames(getState());
  let channelId: number = 0;

  if (bufferNames.length > 0) {
    channelId = parseInt(bufferNames[bufferNames.length - 1].match(/channel(\d+)/)[1] as string, 10) + 1;
  }

  const name = `channel${channelId}`;

  dispatch(updateBuffer(name, getFragmentShaderSource()));
  // dispatch(updateBuffer(name, kekShader));
  dispatch(setOutputBuffer(name));
  dispatch(selectBuffer(name));
  dispatch(setBuffersOrder([...Selectors.buffersOrder(getState()), name]));
}

export const createTexture = (): ThunkResult => (dispatch, getState) => {
  const textureNames = Selectors.textureNames(getState());
  let channelId: number = 0;

  if (textureNames.length > 0) {
    channelId = parseInt(textureNames[textureNames.length - 1].match(/texture(\d+)/)[1] as string, 10) + 1;
  }

  const name = `texture${channelId}`;

  dispatch(updateTexture(name, {
    src: 'https://i1.wp.com/www.synthtopia.com/wp-content/uploads/2018/12/aphex-twin-e1544115642976.jpg',
  }));
}

export const updateTexture = (
  name: string,
  texture: Texture,
): ThunkResult<ReturnType<typeof setTextures>> => (dispatch, getState) => {
  if (!name) {
    return;
  }

  const textures = Selectors.textures(getState());

  dispatch(setTextures({ ...textures, [name]: texture }));
};

export const removeTexture = (
  name: string,
): ThunkResult => (dispatch, getState) => {
  const state = getState();
  const { [name]: deletedTexture, ...textures } = Selectors.textures(state);

  dispatch(setTextures(textures));
};
