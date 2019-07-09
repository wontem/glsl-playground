import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpTriggerOnce extends OpLifeCycle {
  name = 'OpTriggerOnce';

  constructor(node: OpNodeStore) {
    super(node);

    this.addOutTrigger('trigger');

    this.addOutPort('isTriggered', PortDataType.BOOL, false);

    this.addInTrigger('trigger', () => {
      if (!this.outputState.isTriggered) {
        this.triggerOut('trigger');
        this.sendOutPortValue('isTriggered', true);
      }
    });

    this.addInTrigger('reset', () => {
      this.sendOutPortValue('isTriggered', false);
    });
  }
}
