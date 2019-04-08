import { observable, computed, action } from 'mobx';
import * as uuid from 'uuid/v4';

import { NodeStore } from './NodeStore';
import { PORT_WIDTH, PORT_STEP, NODE_HEIGHT, PORT_HEIGHT, PortType, PortDataType, PortColors } from '../constants';
import { GraphStore } from './GraphStore';
import { LinkStore } from './LinkStore';


export class PortStore<T extends PortType = PortType> {
  readonly id: string = uuid();
  @observable label: string = '';

  constructor(
    private graph: GraphStore,
    readonly node: NodeStore,
    readonly type: T,
    readonly dataType: PortDataType,
  ) {}

  get color(): string {
    return PortColors[this.dataType];
  };

  @computed get index() {
    return this.node.getPortIndex(this.id);
  }

  @computed get relX() {
    return (PORT_WIDTH + PORT_STEP) * this.index + 0.5 * PORT_WIDTH;
  }

  @computed get relY() {
    return this.type === PortType.OUTPUT ? NODE_HEIGHT + PORT_HEIGHT / 2 : -PORT_HEIGHT / 2;
  }

  @computed get x() {
    return this.node.x + this.relX;
  }

  @computed get y() {
    return this.node.y + this.relY;
  }

  @computed get links(): Set<LinkStore> {
    return this.graph.portToLinks.get(this);
  }

  @computed get linkedPorts(): Set<PortStore> {
    return this.graph.portToPorts.get(this);
  }

  isLinked(port: PortStore): boolean {
    return this.graph.checkPortsLink(this, port);
  }

  @action link(port: PortStore): void {
    this.graph.addLink(this, port);
  }

  @action unlink(port: PortStore) {
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

  @action delete() {
    this.unlinkAll();
    this.node.ports.delete(this.id);
  }
}
