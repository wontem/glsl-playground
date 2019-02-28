import { ThunkAction } from 'redux-thunk';
import * as monaco from 'monaco-editor';

import * as ActionCreators from '../actions/canvasView';

export interface State {
}

export interface OwnProps {

}

export interface Item {
  name: string;
  source: string;
  markers: monaco.editor.IMarkerData[];
  isActive: boolean;
};

export interface StateProps {
  items: Item[];
}

interface _DispatchProps {
  onChange: typeof ActionCreators.updateBuffer;
}

export type DispatchProps = ConnectProps<_DispatchProps>;


type ConnectedThunk<T> = T extends (...args: infer K) => ThunkAction<infer R, infer _S, infer _Element, infer _A> ? (...args: K) => R : T;

type ConnectProps<T extends object> = {
  [P in keyof T]: ConnectedThunk<T[P]>
};

export type Props = OwnProps & StateProps & DispatchProps;
