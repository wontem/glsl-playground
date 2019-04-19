import { observable, computed, action } from 'mobx';
import * as uuid from 'uuid/v4';

import { PortStore } from './PortStore';
import { PortType, NODE_HEIGHT, NodeType, PORT_WIDTH, PORT_STEP, NODE_MIN_WIDTH } from '../constants';
import { GraphStore } from './GraphStore';
import { NodeTemplate } from '../types';

export class NodeStore {
  static fromTemplate(template: NodeTemplate): NodeStore {
    const node = new NodeStore();
    if (typeof template.label === 'string') {
      node.label = template.label;
    }

    template.inputs.forEach(portTemplate => {
      const port = new PortStore(node, PortType.INPUT, portTemplate.type);
      if (typeof portTemplate.label === 'string') {
        port.label = portTemplate.label;
      }
      node.addPort(port);
    });

    template.outputs.forEach(portTemplate => {
      const port = new PortStore(node, PortType.OUTPUT, portTemplate.type);
      if (typeof portTemplate.label === 'string') {
        port.label = portTemplate.label;
      }
      node.addPort(port);
    });

    return node;
  }

  id: Readonly<string> = uuid();
  @observable graph: GraphStore = null;
  @observable x: number = 0;
  @observable y: number = 0;
  @observable label: string = '';
  @observable color: string = '';
  @observable ports: Map<string, PortStore> = new Map();

  @computed protected get inputs(): string[] {
    return [...this.ports].filter(([, { type }]) => type === PortType.INPUT).map(([id]) => id);
  }

  @computed protected get outputs(): string[] {
    return [...this.ports].filter(([id, { type }]) => type === PortType.OUTPUT).map(([id]) => id);
  }

  @computed get center() {
    return [this.x + this.width / 2, this.y + this.height / 2];
  }

  set center([x, y]: [number, number]) {
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
  }

  constructor(
    public type: NodeType = NodeType.DEFAULT,
  ) {
    // TODO: remove this
    this.label = this.id.slice(0, 8);
  }

  @computed get width() {
    const maxPortsNumber = Math.max(this.inputs.length, this.outputs.length);

    return Math.max(NODE_MIN_WIDTH, maxPortsNumber * (PORT_WIDTH + PORT_STEP) - PORT_STEP);
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

    return null;
  }

  @action addPort(port: PortStore): void {
    this.ports.set(port.id, port);
  }

  getPortIndex(id: string): number {
    if (!this.ports.has(id)) {
      return -1;
    }

    const port = this.ports.get(id);

    return this.getPortsOrder(port.type).indexOf(id);
  }

  @action delete(): void {
    this.ports.forEach(port => port.delete());
    this.graph.nodes.delete(this.id);
  }
}
