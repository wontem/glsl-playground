import { Graph } from '../Graph';
import { ParamAddress, ParamDataCollection } from '../Graph/types';
import { GLStateContext } from './contexts';
import { GLState } from './modules/GLState';
import { Looper } from './modules/Looper';
import { OperatorCreators } from './OperatorCreators';
import { OperatorType } from './OperatorCreators/types';
import { IncomingMessage, IncomingMessageType } from './types';

const graph = new Graph();
const looper = new Looper((cb) => setImmediate(cb), (id) => clearImmediate(id));

looper.on('tick', () => graph.tick());

addEventListener('message', (e) => {
  const data: IncomingMessage = e.data;
  console.log(data);

  switch (data.type) {
    case IncomingMessageType.INIT: {
      GLStateContext.set(new GLState(data.payload));
      break;
    }
    case IncomingMessageType.CLEAR: {
      graph.reset();
      break;
    }
    case IncomingMessageType.USE_PROJECT: {
      useProject(
        graph,
        JSON.parse(new TextDecoder('utf8').decode(data.payload)),
      );
      break;
    }
    case IncomingMessageType.ACTIVATE: {
      looper.start();
      break;
    }
    case IncomingMessageType.DEACTIVATE: {
      looper.stop();
      break;
    }
    case IncomingMessageType.CREATE_NODE: {
      createNode(graph, data.payload.type, data.payload.id);
      break;
    }
    case IncomingMessageType.DELETE_NODE: {
      graph.removeNode(data.payload);
      break;
    }
    case IncomingMessageType.CREATE_LINK: {
      addLink(graph, data.payload.output, data.payload.input);
      break;
    }
    case IncomingMessageType.DELETE_LINK: {
      graph.removeLink(data.payload.output, data.payload.input);
      break;
    }
    case IncomingMessageType.SET_NODE_PARAMETERS: {
      setNodeParameters(graph, data.payload.id, data.payload.parameters);
      break;
    }
  }
});

export interface ProjectData {
  name: string;
  nodes: {
    op: {
      type: OperatorType;
      state: ParamDataCollection;
    };
    id: string;
  }[];
  links: {
    output: ParamAddress;
    input: ParamAddress;
  }[];
}

function createNode(graph: Graph, type: OperatorType, id: string): void {
  const node = new OperatorCreators[type](id);
  graph.addNode(node);
}

function setNodeParameters(
  graph: Graph,
  nodeId: string,
  parameters: ParamDataCollection,
): void {
  graph.addToNodeState(nodeId, parameters);
}

function useProject(graph: Graph, project: ProjectData): void {
  console.log(project);
  looper.stop();

  graph.reset();

  project.nodes.forEach(({ op: { type, state }, id }) => {
    createNode(graph, type, id);
  });

  // graph.tick();

  project.nodes.forEach(({ op: { type, state }, id }) => {
    setNodeParameters(graph, id, state);
  });

  graph.tick();

  project.links.forEach(({ output, input }) => {
    addLink(graph, output, input);
  });

  looper.start();
}

function addLink(
  graph: Graph,
  output: ParamAddress,
  input: ParamAddress,
): void {
  graph.addLink(output, input);
}
