import { PortType } from '../constants';
import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';

export interface PortalsPair {
  input: PortalPortStore<PortType.INPUT>;
  output: PortalPortStore<PortType.OUTPUT>;
}

export class PortalPortStore<T extends PortType = PortType> extends PortStore<
  T
> {
  static createPortalsPair(
    inputNode: NodeStore,
    outputNode: NodeStore,
    dataType: string,
  ): PortalsPair {
    const input = new PortalPortStore(inputNode, PortType.INPUT, dataType);
    const output = new PortalPortStore(outputNode, PortType.OUTPUT, dataType);

    [input.portal, output.portal] = [output, input];

    inputNode.addPort(input);
    outputNode.addPort(output);

    return {
      input,
      output,
    };
  }

  private portal!: PortalPortStore<Exclude<PortType, T>>;

  constructor(readonly node: NodeStore, type: T, dataType: string) {
    super(node, type, dataType);
  }

  get portalPorts(): Set<PortStore> | undefined {
    return this.portal.linkedPorts;
  }
}
