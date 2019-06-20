import { PortType } from '../constants';
import { GroupIOStore } from './GroupIOStore';
import { PortStore } from './PortStore';

export interface TempPortStore {
  node: GroupIOStore;
}

export class TempPortStore extends PortStore {
  get index(): number {
    return this.node.ports.size;
  }

  constructor(node: GroupIOStore, type: PortType) {
    super(node, type, ''); // TODO: third parameter
  }
}
