import { GraphStore, GraphStoreConfig } from './GraphStore';
import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { NodeType } from '../constants';
import { GroupIOStore } from './GroupIOStore';
import { PortalPortStore } from './PortalPortStore';

export interface GroupStore {
  ports: Map<string, PortalPortStore>;
  addPort(port: PortalPortStore): void;
}

export class GroupStore extends NodeStore {
  groupGraph: GraphStore;
  inputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_INPUTS);
  outputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_OUTPUTS);
  portPortals: Map<PortalPortStore, PortStore> | Map<PortStore, PortalPortStore> = new Map();

  constructor(graphStoreConfig?: GraphStoreConfig) {
    super(NodeType.GROUP);

    this.groupGraph = new GraphStore(graphStoreConfig);

    this.groupGraph.bindNode(this.inputsNode);
    this.groupGraph.bindNode(this.outputsNode);
  }
}
