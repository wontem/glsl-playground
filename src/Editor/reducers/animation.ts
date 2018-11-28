import { handleActions } from 'redux-actions';
import { ActionTypes } from '../actionTypes/animation';

export interface State {
  isPlaying: boolean;
}

const initialState: State = {
  isPlaying: false,
};

export const animation = handleActions<State, any>(
  {
    [ActionTypes.TOGGLE_ANIMATION]: (state, action): State => {
      return {
        ...state,
        isPlaying: action.payload,
      };
    }
  },
  initialState,
);
