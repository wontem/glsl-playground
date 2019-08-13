import { action, observable } from 'mobx';
import uuid from 'uuid/v4';
import { PortType } from '../constants';
import { GraphStore } from './GraphStore';
import { PortStore } from './PortStore';

export class LinkStore {
  @observable graph!: GraphStore;
  id: Readonly<string> = uuid();
  in: PortStore<PortType.OUTPUT>;
  out: PortStore<PortType.INPUT>;

  constructor(
    output: PortStore<PortType.OUTPUT>,
    input: PortStore<PortType.INPUT>,
  ) {
    this.in = output;
    this.out = input;
  }

  @action delete() {
    this.graph.links.delete(this.id);
  }
}
