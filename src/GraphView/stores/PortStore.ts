import { observable, action } from 'mobx';
import * as uuid from 'uuid/v4';

import { NodeStore } from './NodeStore';
import { PORT_WIDTH, PORT_STEP, NODE_HEIGHT, PORT_HEIGHT, PortType, PortDataType, PortColors } from '../constants';
import { GraphStore } from './GraphStore';
import { LinkStore } from './LinkStore';


export class PortStore<T extends PortType = PortType> {
  readonly id: string = uuid();
  @observable label: string = '';

  constructor(
    readonly node: NodeStore,
    readonly type: T,
    readonly dataType: PortDataType,
  ) { }

  get color(): string {
    return PortColors[this.dataType];
  };

  get graph(): GraphStore {
    return this.node.graph;
  }

  get index(): number {
    return this.node.getPortIndex(this.id);
  }

  get relX(): number {
    return (PORT_WIDTH + PORT_STEP) * this.index + 0.5 * PORT_WIDTH;
  }

  get relY(): number {
    return this.type === PortType.OUTPUT ? NODE_HEIGHT + PORT_HEIGHT / 2 : -PORT_HEIGHT / 2;
  }

  get x(): number {
    return this.node.x + this.relX;
  }

  get y(): number {
    return this.node.y + this.relY;
  }

  get links(): Set<LinkStore> {
    return this.graph.portToLinks.get(this);
  }

  get linkedPorts(): Set<PortStore> {
    return this.graph.portToPorts.get(this);
  }

  isLinked(port: PortStore): boolean {
    return this.graph.checkPortsLink(this, port);
  }

  @action link(port: PortStore<PortType.INPUT>): void {
    if (this.type === PortType.OUTPUT) {
      this.graph.addLink(this as PortStore<PortType.OUTPUT>, port);
    } else {
      console.error('wrong types');
    }
  }

  @action unlink(port: PortStore): void {
    if (this.graph.portToLinks.has(port)) {
      for (const link of this.graph.portToLinks.get(this)) {
        const anotherPort = port.type === PortType.INPUT ? link.out : link.in;
        if (port === anotherPort) {
          link.delete();
          break;
        }
      }
    }
  }

  @action unlinkAll(): void {
    this.linkedPorts && this.linkedPorts.forEach(port => this.unlink(port));
  }

  @action delete(): void {
    this.unlinkAll();
    this.node.ports.delete(this.id);
  }
}
