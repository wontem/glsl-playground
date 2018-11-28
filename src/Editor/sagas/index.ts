import { takeEvery, select, put } from 'redux-saga/effects';

import { ActionTypes as CanvasViewActionTypes } from '../actionTypes/canvasView';
import { ActionTypes as AnimationActionTypes } from '../actionTypes/animation';
import * as ActionCreators from '../actions/canvasView';
import * as AnimationActionCreators from '../actions/animation';
import * as Selectors from '../selectors/canvasView';
import { getView, init as initView } from '../api/canvasView';
import { BufferInfo } from '../reducers/canvasView';
import { ViewEventType } from '../../View/models';
import { parseLogs } from '../../View/utils/parseLogs';

function render() {
  getView().render(
    [
      {
        name: 'u_time',
        method: '1f',
        value: [lastTime / 1000],
      },
      {
        name: 'u_frame',
        method: '1f',
        value: [currentFrame],
      },
    ],
  );
}

function init(action: ReturnType<typeof ActionCreators.init>) {
  initView(action.payload);
}

function* createBuffer(action: ReturnType<typeof ActionCreators.createBuffer>) {
  const buffers: ReturnType<typeof Selectors.buffers> = yield select(Selectors.buffers);
  const bufferNames: ReturnType<typeof Selectors.bufferNames> = yield select(Selectors.bufferNames);
  let channelId: number = 0;

  if (bufferNames.length > 0) {
    channelId = parseInt(bufferNames[bufferNames.length - 1].match(/channel(\d+)/)[1] as string, 10) + 1;
  }

  const name = `channel${channelId}`;
  getView().createBuffer(name);

  const bufferInfo: BufferInfo = {
    name,
    source: getView().getBufferSource(name),
    errors: [],
  };

  yield put(ActionCreators.setBuffers({
    ...buffers,
    [bufferInfo.name]: bufferInfo,
  }));
  yield put(ActionCreators.selectBuffer(bufferInfo.name));
  yield put(ActionCreators.setOutputBuffer(bufferInfo.name));

  const buffersOrder: string[] = yield select(Selectors.buffersOrder);
  yield put(ActionCreators.setBuffersOrder([...buffersOrder, bufferInfo.name]));
}

function* updateBufferRequest(action: ReturnType<typeof ActionCreators.updateBufferRequest>) {
  const { name, source } = action.payload;
  const oldBuffer = yield select(Selectors.bufferSelectorCreator(name));

  if (oldBuffer.source !== source) {
    const errors = getView().updateBuffer(name, source);
    const shaderErrors = errors.reduce<ReturnType<typeof parseLogs>>(
      (errors, { type, message }) => {
        if (type === ViewEventType.CREATE_SHADER) {
          errors = [...errors, ...parseLogs(message)];
        }

        return errors;
      },
      [],
    );

    render();

    yield put(ActionCreators.updateBuffer({
      name,
      source,
      errors: shaderErrors,
    }));
  }
}

function* removeBuffer(action: ReturnType<typeof ActionCreators.removeBuffer>) {
  const buffers: ReturnType<typeof Selectors.buffers> = yield select(Selectors.buffers);
  const bufferNames: ReturnType<typeof Selectors.bufferNames> = yield select(Selectors.bufferNames);
  const buffersOrder: ReturnType<typeof Selectors.buffersOrder> = yield select(Selectors.buffersOrder);
  yield put(ActionCreators.setBuffersOrder(buffersOrder.filter(bufferName => bufferName !== action.payload)));

  getView().removeBuffer(action.payload);

  const newBuffers: Record<string, BufferInfo> = bufferNames
    .filter(name => name !== action.payload)
    .reduce<Record<string, BufferInfo>>(
      (reduction, key) => {
        reduction[key] = buffers[key];

        return reduction;
      },
      {},
    );

  yield put(ActionCreators.setBuffers(newBuffers));
}

function setOutputBuffer(action: ReturnType<typeof ActionCreators.setOutputBuffer>) {
  getView().setBufferToOutput(action.payload);
  render();
}

function setBuffersOrder(action: ReturnType<typeof ActionCreators.setBuffersOrder>) {
  getView().setBuffersOrder(action.payload);
}

let animationFrame: number;
let startTime: number = null;
let currentFrame: number = 0;
let lastTime: number = 0;

function toggleAnimation(action: ReturnType<typeof AnimationActionCreators.toggleAnimation>) {
  cancelAnimationFrame(animationFrame);

  if (action.payload) {
    startTime = performance.now() - lastTime;

    animationFrame = requestAnimationFrame(function anim () {
      lastTime = performance.now() - startTime;

      render();

      currentFrame += 1;

      animationFrame = requestAnimationFrame(anim);
    });
  }
}

function resetAnimation() {
  currentFrame = 0;
  lastTime = 0;
  startTime = performance.now();
  render();
}

export default function* rootSaga() {
  yield takeEvery(CanvasViewActionTypes.INIT, init);
  yield takeEvery(CanvasViewActionTypes.CREATE_BUFFER, createBuffer);
  yield takeEvery(CanvasViewActionTypes.REMOVE_BUFFER, removeBuffer);
  yield takeEvery(CanvasViewActionTypes.UPDATE_BUFFER_REQUEST, updateBufferRequest);
  yield takeEvery(CanvasViewActionTypes.SET_OUTPUT_BUFFER, setOutputBuffer);
  yield takeEvery(CanvasViewActionTypes.SET_BUFFERS_ORDER, setBuffersOrder);
  yield takeEvery(AnimationActionTypes.TOGGLE_ANIMATION, toggleAnimation);
  yield takeEvery(AnimationActionTypes.RESET_ANIMATION, resetAnimation);
}
