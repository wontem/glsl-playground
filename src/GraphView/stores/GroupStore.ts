import { GraphStore } from './GraphStore';
import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { NodeType } from '../constants';
import { GroupIOStore } from './GroupIOStore';

export class GroupStore extends NodeStore {
  groupGraph: GraphStore = new GraphStore();
  inputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_INPUTS);
  outputsNode: GroupIOStore = new GroupIOStore(this, NodeType.GROUP_OUTPUTS);
  portPortals: Map<PortStore, PortStore> = new Map();

  constructor() {
    super(NodeType.GROUP);

    this.groupGraph.bindNode(this.inputsNode);
    this.groupGraph.bindNode(this.outputsNode);
  }
}
