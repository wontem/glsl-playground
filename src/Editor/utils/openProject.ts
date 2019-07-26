import { action } from 'mobx';
import { GLState } from '../../GLContext';
import { PortType } from '../../GraphView/constants';
import { PortDataType } from '../../GraphView/operator/constants';
import { OperatorsMap } from '../../GraphView/ops';
import { GraphStore } from '../../GraphView/stores/GraphStore';
import { OpNodeStore } from '../../GraphView/stores/OpNodeStore';

// import { ProjectData as OldProjectData } from "../actions/canvasView";

// export const convertOldProject = (project: ProjectData) => {

// }

const PORT_TYPES_TO_SAVE: Set<string> = new Set([
  PortDataType.ARRAY,
  PortDataType.BOOL,
  PortDataType.NUMBER,
  PortDataType.STRING,
  PortDataType.SELECT,
]);

interface SerializedOp {
  type: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

interface SerializedNode {
  op?: SerializedOp;
  id: string;
  x: number;
  y: number;
}

interface SerializedLink {
  in: [string, string];
  out: [string, string];
}

export interface ProjectData {
  name: string;
  nodes: SerializedNode[];
  links: SerializedLink[];
}

export const getProjectData = (
  name: string,
  graph: GraphStore,
): ProjectData => {
  const projectData: ProjectData = {
    name,
    nodes: [],
    links: [],
  };

  graph.nodes.forEach((node) => {
    const nodeData: SerializedNode = {
      id: node.id,
      x: node.x,
      y: node.y,
    };

    if (node instanceof OpNodeStore) {
      const op = node.op;

      const opData: SerializedOp = {
        type: op.constructor.name, // TODO: use enum
        inputs: {},
        outputs: {},
      };

      op.inputs.forEach(([name, port]) => {
        if (PORT_TYPES_TO_SAVE.has(port.dataType)) {
          opData.inputs[name] = op.state[name];
        }
      });

      op.outputs.forEach(([name, port]) => {
        if (PORT_TYPES_TO_SAVE.has(port.dataType)) {
          opData.outputs[name] = op.outputState[name];
        }
      });

      nodeData.op = opData;
    }

    projectData.nodes.push(nodeData);
  });

  graph.links.forEach((link) => {
    projectData.links.push({
      in: [
        link.in.node.id,
        (link.in.node as OpNodeStore).op.getNameByPort(link.in)!,
      ],
      out: [
        link.out.node.id,
        (link.out.node as OpNodeStore).op.getNameByPort(link.out)!,
      ],
    });
  });

  return projectData;
};

export const useProjectData = action(
  (graph: GraphStore, projectData: ProjectData, glState: GLState): void => {
    projectData.nodes.forEach((serializedNode) => {
      if (serializedNode.op) {
        const OpConstructor = OperatorsMap.get(serializedNode.op.type)!;

        const node = new OpNodeStore();
        node.id = serializedNode.id;
        node.x = serializedNode.x;
        node.y = serializedNode.y;
        graph.bindNode(node);

        new OpConstructor(node, glState);
      }
    });
    projectData.nodes.forEach((serializedNode) => {
      if (serializedNode.op) {
        const op = (graph.nodes.get(serializedNode.id) as OpNodeStore).op;

        op.updateInputState(serializedNode.op.inputs);
        op.updateOutputState(serializedNode.op.outputs);
      }
    });

    setImmediate(
      action(() => {
        projectData.links.forEach((link) => {
          const fromPort = (graph.nodes.get(
            link.in[0],
          )! as OpNodeStore).op.getPortByName(PortType.OUTPUT, link.in[1]);
          const toPort = (graph.nodes.get(
            link.out[0],
          )! as OpNodeStore).op.getPortByName(PortType.INPUT, link.out[1]);

          if (!fromPort || !toPort) {
            console.error(`Cannot find port for link [${link.out.join()}]`);
            debugger;
            return;
          }

          fromPort.link(toPort);
        });
      }),
    );
  },
);
