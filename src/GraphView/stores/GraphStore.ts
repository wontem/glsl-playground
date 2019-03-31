import { observable, action, computed } from 'mobx';

import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { LinkStore } from './LinkStore';
import { PortType, PortDataType } from '../constants';

export class GraphStore {
  @observable nodes: Map<string, NodeStore> = new Map();
  @observable links: Map<string, LinkStore> = new Map();

  @computed get portToPorts(): Map<PortStore, Set<PortStore>> {
    const portIdToPortIds = new Map<PortStore, Set<PortStore>>();

    const addLink = (from: PortStore, to: PortStore): void => {
      const portsSet = portIdToPortIds.get(from) || new Set();

      portsSet.add(to);

      portIdToPortIds.set(from, portsSet);
    };

    this.links.forEach((link) => {
      addLink(link.from, link.to);
      addLink(link.to, link.from);
    });

    return portIdToPortIds;
  }

  checkPortsLink(portA: PortStore, portB: PortStore): boolean {
    return this.portToPorts.has(portA) && this.portToPorts.get(portA).has(portB);
  }

  @action addLink(fromPort: PortStore, toPort: PortStore): void {
    const link = new LinkStore(
      fromPort,
      toPort,
    );

    this.links.set(link.id, link);
  }

  @action
  addNode(x: number, y: number): void {
    const node = new NodeStore(this);
    node.x = x;
    node.y = y;
    node.label = node.id.slice(0, 8);

    this.nodes.set(node.id, node);

    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.TRIGGER));
    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.FLOAT));
    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.FLOAT));
    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.TEXTURE));
    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.INT));
    node.addPort(new PortStore(this, node, PortType.INPUT, PortDataType.VEC2));

    node.addPort(new PortStore(this, node, PortType.OUTPUT, PortDataType.TRIGGER));
    node.addPort(new PortStore(this, node, PortType.OUTPUT, PortDataType.FLOAT));
    node.addPort(new PortStore(this, node, PortType.OUTPUT, PortDataType.INT));
    node.addPort(new PortStore(this, node, PortType.OUTPUT, PortDataType.TEXTURE));
    node.addPort(new PortStore(this, node, PortType.OUTPUT, PortDataType.VEC2));
  }

  @action
  deleteNode(id: string) {
    this.nodes.delete(id);
  }
}
