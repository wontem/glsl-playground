import { action } from 'mobx';
import { NodeType } from '../constants';
import { GraphStore, GraphStoreConfig } from './GraphStore';
import { GroupIOStore } from './GroupIOStore';
import { NodeStore } from './NodeStore';
import { PortalPortStore } from './PortalPortStore';

export interface GroupStore {
  ports: Map<string, PortalPortStore>;
  addPort(port: PortalPortStore): void;
}

export class GroupStore extends NodeStore {
  groupGraph: GraphStore;
  inputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_INPUTS);
  outputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_OUTPUTS);

  constructor(graphStoreConfig?: GraphStoreConfig) {
    super(NodeType.GROUP);

    this.groupGraph = new GraphStore(graphStoreConfig);

    this.groupGraph.bindNode(this.inputsNode);
    this.groupGraph.bindNode(this.outputsNode);
  }

  @action delete(): void {
    this.groupGraph.nodes.forEach((node) => node.delete());

    this.deleteAsNode();
  }
}
