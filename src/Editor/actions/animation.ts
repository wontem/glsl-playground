import { createAction } from 'redux-actions';

import { ActionTypes } from '../actionTypes/animation';

export const toggleAnimation = createAction(ActionTypes.TOGGLE_ANIMATION, (isPlaying: boolean) => isPlaying);
export const resetAnimation = createAction(ActionTypes.RESET_ANIMATION);
