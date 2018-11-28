import { State } from '../reducers/animation';

const canvasView = (state: any): State => state.animation;

export const isPlaying = (state: any) => canvasView(state).isPlaying;
