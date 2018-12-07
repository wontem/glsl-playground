import { ThunkAction } from 'redux-thunk';

import * as ActionCreators from '../actions/canvasView';

export interface OwnProps {

}

export interface StateProps {
  textureNames: string[];
}

interface _DispatchProps {
  createTexture: typeof ActionCreators.createTexture;
  removeTexture: typeof ActionCreators.removeTexture;
}

export type DispatchProps = ConnectProps<_DispatchProps>;


type ConnectedThunk<T> = T extends (...args: infer K) => ThunkAction<infer R, infer _S, infer _Element, infer _A> ? (...args: K) => R : T;

type ConnectProps<T extends object> = {
  [P in keyof T]: ConnectedThunk<T[P]>
};

export type Props = OwnProps & StateProps & DispatchProps;
