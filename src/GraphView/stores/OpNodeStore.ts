import { action } from 'mobx';
import { NodeType } from '../constants';
import { OpLifeCycle } from '../operator/OpLifeCycle';
import { NodeStore } from './NodeStore';

export class OpNodeStore extends NodeStore {
  public op!: OpLifeCycle;

  constructor() {
    super(NodeType.OP);
  }

  @action delete(): void {
    this.op.destroy();

    this.deleteAsNode();
  }
}
