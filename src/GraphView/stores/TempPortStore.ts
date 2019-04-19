import { PortStore } from './PortStore';
import { PortType, PortDataType } from '../constants';
import { NodeStore } from './NodeStore';
import { GroupIOStore } from './GroupIOStore';

export class TempPortStore extends PortStore {
  node: GroupIOStore;

  get index(): number {
    return this.node.ports.size;
  }

  constructor(node: NodeStore, type: PortType) {
    super(node, type, PortDataType.ANY);
  }
}
