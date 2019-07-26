import { GLState } from '../../GLContext';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLCanvasSize extends OpLifeCycle {
  name = 'OpGLCanvasSize';
  private glState: GLState;

  constructor(node: OpNodeStore, glState: GLState) {
    super(node);

    this.glState = glState;

    this.addOutPort('width', PortDataType.NUMBER, this.glState.width);
    this.addOutPort('height', PortDataType.NUMBER, this.glState.height);
    this.addOutTrigger('change');

    this.glState.on('resize', ([width, height]) => {
      this.sendOutPortValue('width', width);
      this.sendOutPortValue('height', height);
      this.triggerOut('change');
    });
  }

  opWillBeDestroyed() {
    this.glState.removeAllListeners('resize');
  }
}
