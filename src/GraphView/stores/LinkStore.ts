import * as uuid from 'uuid/v4';
import { PortStore } from './PortStore';
import { GraphStore } from './GraphStore';
import { action } from 'mobx';
import { PortType } from '../constants';

export class LinkStore {
  id: Readonly<string> = uuid();
  in: PortStore<PortType.OUTPUT>;
  out: PortStore<PortType.INPUT>;

  // get type() {

  // }

  constructor(private graph: GraphStore, output: PortStore<PortType.OUTPUT>, input: PortStore<PortType.INPUT>) {
    this.in = output;
    this.out = input;
  }

  @action delete() {
    this.graph.links.delete(this.id);
  }
}
