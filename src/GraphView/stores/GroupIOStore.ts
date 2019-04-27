import { action, computed } from 'mobx';
import {
  NODE_MIN_WIDTH,
  NodeType,
  PORT_STEP,
  PORT_WIDTH,
  PortType,
} from '../constants';
import { GroupStore } from './GroupStore';
import { NodeStore } from './NodeStore';
import { PortalPortStore } from './PortalPortStore';
import { TempPortStore } from './TempPortStore';

export interface GroupIOStore {
  ports: Map<string, PortalPortStore>;
  addPort(port: PortalPortStore): void;
}

export class GroupIOStore extends NodeStore {
  tempPort: TempPortStore;

  constructor(
    public group: GroupStore,
    type: NodeType.GROUP_INPUTS | NodeType.GROUP_OUTPUTS,
  ) {
    super(type);

    const tempPortType =
      this.type === NodeType.GROUP_INPUTS ? PortType.OUTPUT : PortType.INPUT;
    this.tempPort = new TempPortStore(this, tempPortType);

    this.label = this.type === NodeType.GROUP_INPUTS ? 'inputs' : 'outputs';
  }

  @computed get width() {
    return Math.max(
      NODE_MIN_WIDTH,
      (this.ports.size + 1) * (PORT_WIDTH + PORT_STEP) - PORT_STEP,
    );
  }

  @action delete(): void {}
}
