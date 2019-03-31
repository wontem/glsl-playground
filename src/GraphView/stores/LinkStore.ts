import { observable } from 'mobx';
import * as uuid from 'uuid/v4';
import { PortStore } from './PortStore';

export class LinkStore {
  id: Readonly<string> = uuid();
  @observable from: PortStore;
  @observable to: PortStore;

  constructor(from: PortStore, to: PortStore) {
    this.from = from;
    this.to = to;
  }
}
