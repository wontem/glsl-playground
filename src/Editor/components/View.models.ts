import { ThunkAction } from 'redux-thunk';

import * as ActionCreators from '../actions/canvasView';

export interface State {
  startTime: number;
  currentTime: number;
  prevTime: number;
  currentFrame: number;
  isPlaying: boolean;
  isHD: boolean;
  mouseStart: number[];
  mouseEnd: number[];
  mouse: number[];
  isMousePressed: boolean;
  isRecording: boolean;
  name: string;
  width: number;
  height: number;
  currentWidth: number;
  currentHeight: number;
}

export interface OwnProps {

}

export interface StateProps extends ActionCreators.ProjectData {

}

interface _DispatchProps {
  setProject: typeof ActionCreators.setProject;
  setProjectName: typeof ActionCreators.setProjectName;
  onError: typeof ActionCreators.setErrorsForBuffers;
}

export type DispatchProps = ConnectProps<_DispatchProps>;


type ConnectedThunk<T> = T extends (...args: infer K) => ThunkAction<infer R, infer _S, infer _Element, infer _A> ? (...args: K) => R : T;

type ConnectProps<T extends object> = {
  [P in keyof T]: ConnectedThunk<T[P]>
};

export type Props = OwnProps & StateProps & DispatchProps;
