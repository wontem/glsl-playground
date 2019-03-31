import { observable, computed, action } from 'mobx';
import * as uuid from 'uuid/v4';

import { PortStore } from './PortStore';
import { PortType } from '../constants';
import { GraphStore } from './GraphStore';

export class NodeStore {
  id: Readonly<string> = uuid();
  @observable x: number = 0;
  @observable y: number = 0;
  @observable label: string = '';
  @observable color: string = '';
  @observable ports: Map<string, PortStore> = new Map();

  @computed private get inputs(): string[] {
    return [...this.ports].filter(([id, { type }]) => type === PortType.INPUT).map(([id]) => id);
  }

  @computed private get outputs(): string[] {
    return [...this.ports].filter(([id, { type }]) => type === PortType.OUTPUT).map(([id]) => id);
  }

  constructor(
    private graph: GraphStore,
  ) {}

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
}
