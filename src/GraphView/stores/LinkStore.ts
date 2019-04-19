import * as uuid from 'uuid/v4';
import { PortStore } from './PortStore';
import { GraphStore } from './GraphStore';
import { action, observable } from 'mobx';
import { PortType } from '../constants';

export class LinkStore {
  @observable graph: GraphStore;
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
