import { PortStore } from './PortStore';
import { PortType } from '../constants';
import { GroupIOStore } from './GroupIOStore';

export class TempPortStore extends PortStore {
  node!: GroupIOStore;

  get index(): number {
    return this.node.ports.size;
  }

  constructor(node: GroupIOStore, type: PortType) {
    super(node, type, ''); // TODO: third parameter
  }
}
