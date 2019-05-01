import { AnimationLoop } from '../../Editor/utils/AnimationLoop';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { IOState, OpLifeCycle } from './OpLifeCycle';

export class OpAnimationLoop extends OpLifeCycle<
  {
    isActive: PortDataType.BOOL;
  },
  {
    tick: PortDataType.TRIGGER;
  }
> {
  name = 'AnimationLoop';
  private loop = new AnimationLoop();

  constructor(node: OpNodeStore) {
    super(node);

    this.addInPort('isActive', PortDataType.BOOL, true);
    this.addOutTrigger('tick');

    this.loop.on('tick', () => this.triggerOut('tick'));
  }

  opDidCreate() {
    this.loop.togglePlay(this.state.isActive);
  }

  opDidUpdate(
    prevState: IOState<{
      isActive: PortDataType.BOOL;
    }>,
  ) {
    if (prevState.isActive !== this.state.isActive) {
      this.loop.togglePlay(this.state.isActive);
    }
  }

  opWillBeDestroyed() {
    this.loop.removeAllListeners('tick');
  }
}
