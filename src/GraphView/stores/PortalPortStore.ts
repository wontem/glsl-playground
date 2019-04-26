import { PortStore } from './PortStore';
import { PortType } from '../constants';
import { GroupIOStore } from './GroupIOStore';
import { GroupStore } from './GroupStore';

export class PortalPortStore<T extends PortType = PortType> extends PortStore<T> {
  constructor(readonly node: GroupIOStore | GroupStore, type: T, dataType: string) {
    super(node, type, dataType);
  }

  get portalPorts(): Set<PortStore> | undefined {
    return this.node.portPortals.get(this)!.linkedPorts;
  }
}
