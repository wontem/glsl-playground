import { NodeType, PortType, PORT_WIDTH, PORT_STEP, NODE_MIN_WIDTH } from '../constants';
import { NodeStore } from './NodeStore';
import { TempPortStore } from './TempPortStore';
import { GroupStore } from './GroupStore';
import { action, computed } from 'mobx';
import { PortStore } from './PortStore';
import { PortalPortStore } from './PortalPortStore';

export interface GroupIOStore {
  ports: Map<string, PortalPortStore>;
  addPort(port: PortalPortStore): void;
}

export class GroupIOStore extends NodeStore {
  tempPort: TempPortStore;

  constructor(public group: GroupStore, type: NodeType.GROUP_INPUTS | NodeType.GROUP_OUTPUTS) {
    super(type);

    const tempPortType = this.type === NodeType.GROUP_INPUTS ? PortType.OUTPUT : PortType.INPUT;
    this.tempPort = new TempPortStore(this, tempPortType);

    this.label = this.type === NodeType.GROUP_INPUTS ? 'inputs' : 'outputs';
  }

  // TODO: maybe connect portals inside of PortalPortStore
  get portPortals(): Map<PortalPortStore, PortStore> | Map<PortStore, PortalPortStore> {
    return this.group.portPortals;
  }

  @computed get width() {
    return Math.max(NODE_MIN_WIDTH, (this.ports.size + 1) * (PORT_WIDTH + PORT_STEP) - PORT_STEP);
  }

  @action addGroupPort(port: PortalPortStore): void {
    this.addPort(port);

    const newGroupPort = new PortalPortStore(this.group, port.type === PortType.INPUT ? PortType.OUTPUT : PortType.INPUT, port.dataType);
    this.group.addPort(newGroupPort);

    this.portPortals.set(port, newGroupPort);
    this.portPortals.set(newGroupPort, port);
  }

  @action delete(): void {}
}
