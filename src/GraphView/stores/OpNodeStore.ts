import { action } from 'mobx';
import { NodeType, PortType } from '../constants';
import { PortDataType } from '../operator/constants';
import { OpLifeCycle } from '../operator/OpLifeCycle';
import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';

export class OpNodeStore extends NodeStore {
  public op!: OpLifeCycle;

  constructor() {
    super(NodeType.OP);
  }

  @action delete(): void {
    this.op.destroy();

    this.deleteAsNode();
  }

  onLink(
    fromPort: PortStore<PortType.OUTPUT>,
    toPort: PortStore<PortType.INPUT>,
  ): void {
    if (fromPort.dataType === PortDataType.TRIGGER) {
      return;
    }
    const fromOp = (fromPort.node as OpNodeStore).op;
    const toOp = (toPort.node as OpNodeStore).op;
    const fromName = fromOp['portNames'].get(fromPort)!;
    const toName = toOp['portNames'].get(toPort)!;

    toOp.setInValue(toName, this.op.outputState[fromName]);
  }
}
