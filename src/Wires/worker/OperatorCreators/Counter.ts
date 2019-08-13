import { Node } from '../../Graph';

export interface Counter {
  state: {
    count: 0;
  };
}

export class Counter extends Node {
  constructor(id: string) {
    super(id);

    this.addParameter('count', 0);
    this.addOutValue('count', this.state.count);

    this.addTrigger('reset', () => {
      // TODO: maybe it's better to do that in this.stateDidChange
      const count = 0;
      this.setState({ count });
      this.sendOut('count', count);
    });

    this.addTrigger('increment', () => {
      const count = this.state.count + 1;
      this.setState({ count });
      this.sendOut('count', count);
    });

    this.addTrigger('decrement', () => {
      const count = this.state.count - 1;
      this.setState({ count });
      this.sendOut('count', count);
    });
  }
}
