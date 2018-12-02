import { ThunkAction } from 'redux-thunk';

import * as ActionCreators from '../actions/canvasView';
import { parseLogs } from '../../View/utils/parseLogs';

export interface State {
  value: string;
}

export interface OwnProps {

}

export interface StateProps {
  name: string;
  source: string;
  errors: ReturnType<typeof parseLogs>;
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
