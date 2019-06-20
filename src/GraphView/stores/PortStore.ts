import { action, observable } from 'mobx';
import * as uuid from 'uuid/v4';
import {
  NODE_HEIGHT,
  PORT_HEIGHT,
  PORT_STEP,
  PORT_WIDTH,
  PortType,
} from '../constants';
import { GraphStore } from './GraphStore';
import { LinkStore } from './LinkStore';
import { NodeStore } from './NodeStore';

export class PortStore<T extends PortType = PortType> {
  readonly node: NodeStore;
  readonly type: T;
  readonly dataType: string;
  readonly id: string = uuid();
  @observable label: string = '';

  constructor(
    node: NodeStore,
    type: T,
    dataType: string,
    label: string = name,
  ) {
    this.node = node;
    this.type = type;
    this.dataType = dataType;
    this.label = label;
  }

  get color(): string {
    return this.graph!.config.colors[this.dataType] || 'white';
  }

  get graph(): GraphStore | undefined {
    return this.node.graph;
  }

  get index(): number {
    return this.node.getPortIndex(this.id);
  }

  get relX(): number {
    return (PORT_WIDTH + PORT_STEP) * this.index + 0.5 * PORT_WIDTH;
  }

  get relY(): number {
    return this.type === PortType.OUTPUT
      ? NODE_HEIGHT + PORT_HEIGHT / 2
      : -PORT_HEIGHT / 2;
  }

  get x(): number {
    return this.node.x + this.relX;
  }

  get y(): number {
    return this.node.y + this.relY;
  }

  get links(): Set<LinkStore> | undefined {
    return this.graph!.portToLinks.get(this);
  }

  get linkedPorts(): Set<PortStore> | undefined {
    return this.graph!.portToPorts.get(this);
  }

  // Apply portals
  // @computed
  // get linkedDataPorts(): Set<PortStore> | undefined {
  //   if (!this.linkedPorts) {
  //     return;
  //   }

  //   const linkedDataPorts: Set<PortStore> = new Set();

  //   this.linkedPorts.forEach((port) => {
  //     if (port.node instanceof GroupStore) {
  //       const portalPorts = port.node.portPortals.get(port)!.linkedPorts;
  //       portalPorts && portalPorts.forEach(port => linkedDataPorts.add(port));
  //     } else if (port.node instanceof GroupIOStore) {
  //       const portalPorts = port.node.group.portPortals.get(port)!.linkedPorts;
  //       portalPorts && portalPorts.forEach(port => linkedDataPorts.add(port));
  //     } else {
  //       linkedDataPorts.add(port);
  //     }
  //   });

  //   return linkedDataPorts;
  // }

  isLinked(port: PortStore): boolean {
    return this.graph!.checkPortsLink(this, port);
  }

  @action link(port: PortStore<PortType.INPUT>): void {
    if (this.type === PortType.OUTPUT) {
      this.graph!.addLink(this as PortStore<PortType.OUTPUT>, port);
      this.node.onLink(this as PortStore<PortType.OUTPUT>, port);
    } else {
      console.error('wrong types');
    }
  }

  @action unlink(port: PortStore): void {
    if (this.graph!.portToLinks.has(port)) {
      for (const link of this.graph!.portToLinks.get(this)!) {
        const anotherPort = port.type === PortType.INPUT ? link.out : link.in;
        if (port === anotherPort) {
          link.delete();
          break;
        }
      }
    }
  }

  @action unlinkAll(): void {
    this.linkedPorts && this.linkedPorts.forEach((port) => this.unlink(port));
  }

  @action delete(): void {
    this.unlinkAll();
    this.node.ports.delete(this.id);
  }
}
