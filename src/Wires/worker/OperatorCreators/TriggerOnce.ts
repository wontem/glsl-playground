import { Node } from '../../Graph';

export interface TriggerOnce {
  state: {
    isTriggered: boolean;
  };
}

// TODO: check if this op correct
export class TriggerOnce extends Node {
  constructor(id: string) {
    super(id);

    this.addParameter('isTriggered', false);
    this.addOutTrigger('trigger');
    this.addOutValue('isTriggered', this.state.isTriggered);

    this.addTrigger('trigger', () => {
      this.updateIsTriggered(true);
    });

    this.addTrigger('reset', () => {
      this.updateIsTriggered(false);
    });
  }

  private updateIsTriggered(isTriggered: boolean): void {
    if (this.state.isTriggered !== isTriggered) {
      this.setState({
        isTriggered,
      });
    }
  }

  nodeDidUpdate(prevState: TriggerOnce['state']) {
    if (this.state.isTriggered !== prevState.isTriggered) {
      this.sendOut('isTriggered', this.state.isTriggered);
      if (this.state.isTriggered === true) {
        this.triggerOut('trigger');
      }
    }
  }
}
