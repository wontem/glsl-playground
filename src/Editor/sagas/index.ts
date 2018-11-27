import { eventChannel } from 'redux-saga';
import { takeEvery, select, put, call, take } from 'redux-saga/effects';

import { ActionTypes } from '../actionTypes/canvasView';
import * as ActionCreators from '../actions/canvasView';
import * as Selectors from '../selectors/canvasView';

import { getView, init as initView } from '../api/canvasView';
import { View } from '../../View';
import { BufferInfo } from '../reducers/canvasView';
import { ViewEvent, ViewEventType } from '../../View/models';
import { parseLogs } from '../../View/utils/parseLogs';

function* init(action: ReturnType<typeof ActionCreators.init>) {
  const v = initView(action.payload);
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
    getView().render();

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

function* setOutputBuffer(action: ReturnType<typeof ActionCreators.setOutputBuffer>) {
  getView().setBufferToOutput(action.payload);
  getView().render();
}

function* setBuffersOrder(action: ReturnType<typeof ActionCreators.setBuffersOrder>) {
  getView().setBuffersOrder(action.payload);
}

export default function* rootSaga() {
  yield takeEvery(ActionTypes.INIT, init);
  yield takeEvery(ActionTypes.CREATE_BUFFER, createBuffer);
  yield takeEvery(ActionTypes.REMOVE_BUFFER, removeBuffer);
  yield takeEvery(ActionTypes.UPDATE_BUFFER_REQUEST, updateBufferRequest);
  yield takeEvery(ActionTypes.SET_OUTPUT_BUFFER, setOutputBuffer);
  yield takeEvery(ActionTypes.SET_BUFFERS_ORDER, setBuffersOrder);
}
