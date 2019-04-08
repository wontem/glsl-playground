import { NodeStore } from './NodeStore';
import { GraphStore } from './GraphStore';
import { NodeType } from '../constants';

export class GroupStore extends NodeStore {
  groupGraph: GraphStore = new GraphStore();

  constructor(graph: GraphStore) {
    super(graph, NodeType.GROUP);

    const inputNode = new NodeStore(graph, NodeType.GROUP_INPUTS);
  }
}
