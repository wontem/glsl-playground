import { Node } from '../../Graph';
import { ParamDataCollection } from '../../Graph/types';
import { Looper } from '../modules/Looper';

interface State extends ParamDataCollection {
  isActive: boolean;
}

type OutTrigger = 'tick';

export interface AnimationLoop extends Node {
  state: State;
  triggerOut(name: OutTrigger): void;
  addOutTrigger(name: OutTrigger): void;
  addParameter<P extends keyof State>(param: P, initialValue: State[P]): void;
}

export class AnimationLoop extends Node {
  private loop = new Looper(
    (cb: (time: number) => void) => requestAnimationFrame(cb),
    (id: number) => cancelAnimationFrame(id),
  );

  constructor(id: string) {
    super(id);

    this.addParameter('isActive', false);
    this.addOutTrigger('tick');

    this.loop.on('tick', () => this.triggerOut('tick'));
  }

  nodeDidCreate() {
    this.loop.toggleActive(this.state.isActive);
  }

  nodeDidUpdate(prevState: State) {
    if (prevState.isActive !== this.state.isActive) {
      this.loop.toggleActive(this.state.isActive);
    }
  }

  nodeWillBeDestroyed() {
    this.loop.stop();
    this.loop.removeAllListeners();
  }
}
