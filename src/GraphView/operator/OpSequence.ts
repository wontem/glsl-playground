import { clearImmediate, setImmediate } from 'core-js/web/immediate';
import { OpNodeStore } from '../stores/OpNodeStore';
import { OpLifeCycle } from './OpLifeCycle';

const SEQ_SIZE = 8;

export class OpSequence extends OpLifeCycle {
  name = 'OpSequence';
  private triggerNames: string[] = [];
  private timer?: number;

  constructor(node: OpNodeStore) {
    super(node);

    for (let index = 0; index < SEQ_SIZE; index += 1) {
      this.triggerNames.push(`trigger${index}`);
    }

    this.triggerNames.forEach((triggerName) => this.addOutTrigger(triggerName));

    this.addInTrigger('trigger', () => {
      this.recursiveTrigger(0);
    });
  }

  recursiveTrigger(index: number) {
    const triggerName = this.triggerNames[index];
    this.triggerOut(triggerName);

    const newIndex = index + 1;

    if (newIndex < this.triggerNames.length) {
      this.timer = setImmediate(() => {
        this.timer = undefined;
        this.recursiveTrigger(newIndex);
      });
    }
  }

  opWillBeDestroyed() {
    if (typeof this.timer === 'number') {
      clearImmediate(this.timer);
    }
  }
}
