import { action, computed, observable } from 'mobx';
import uuid from 'uuid/v4';
import {
  NODE_HEIGHT,
  NODE_MIN_WIDTH,
  NodeType,
  PORT_STEP,
  PORT_WIDTH,
  PortType,
} from '../constants';
import { GraphStore } from './GraphStore';
import { PortStore } from './PortStore';

export abstract class NodeStore {
  id: Readonly<string> = uuid();
  @observable graph: GraphStore | undefined;
  @observable textWidth: number = 0;
  @observable x: number = 0;
  @observable y: number = 0;
  @observable label: string = '';
  @observable color: string = '';
  @observable ports: Map<string, PortStore> = new Map();

  @computed protected get inputs(): string[] {
    return [...this.ports]
      .filter(([, { type }]) => type === PortType.INPUT)
      .map(([id]) => id);
  }

  @computed protected get outputs(): string[] {
    return [...this.ports]
      .filter(([, { type }]) => type === PortType.OUTPUT)
      .map(([id]) => id);
  }

  @computed get center() {
    return [this.x + this.width / 2, this.y + this.height / 2];
  }

  set center([x, y]: [number, number]) {
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }

  constructor(public type: NodeType = NodeType.DEFAULT) {
    // TODO: remove this
    this.label = this.id.slice(0, 8);
  }

  @computed get width() {
    const maxPortsNumber = Math.max(this.inputs.length, this.outputs.length);

    return Math.max(
      NODE_MIN_WIDTH,
      maxPortsNumber * (PORT_WIDTH + PORT_STEP) - PORT_STEP,
      this.textWidth + 2 * PORT_WIDTH,
    );
  }

  get height() {
    return NODE_HEIGHT;
  }

  private getPortsOrder(type: PortType): string[] {
    if (type === PortType.INPUT) {
      return this.inputs;
    }

    if (type === PortType.OUTPUT) {
      return this.outputs;
    }

    throw 'Unknown port type';
  }

  @action addPort(port: PortStore): void {
    if (this.ports.has(port.id)) {
      throw 'Port with the same ID already exists';
    }

    this.ports.set(port.id, port);
  }

  getPortIndex(id: string): number {
    if (!this.ports.has(id)) {
      return -1;
    }

    const port = this.ports.get(id)!;

    return this.getPortsOrder(port.type).indexOf(id);
  }

  @action deleteAsNode() {
    this.ports.forEach((port) => port.delete());
    this.graph!.nodes.delete(this.id);
    this.graph = undefined;
  }

  @action delete(): void {
    this.deleteAsNode();
  }

  onLink(
    fromPort: PortStore<PortType.OUTPUT>,
    toPort: PortStore<PortType.INPUT>,
  ): void {}
}
