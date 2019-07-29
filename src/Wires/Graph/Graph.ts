import { Links } from './Links';
import { Event, Node } from './Node';
import { ParamAddress, ParamDataCollection } from './types';

export interface Graph {
  tick(): void;
  reset(): void;
  addNode(node: Node): void;
  removeNode(nodeId: string): void;
  addLink(from: ParamAddress, to: ParamAddress): void;
  removeLink(from: ParamAddress, to: ParamAddress): void;
  addToNodeState(nodeId: string, newState: ParamDataCollection): void;
}

export class Graph {
  private nodes: Record<string, Node> = {};
  private links: Links = new Links();
  private dirtyTriggers: Links = new Links();
  private newStates: Record<string, ParamDataCollection> = {};

  addToNodeState(nodeId: string, newState: ParamDataCollection): void {
    if (nodeId in this.newStates) {
      this.newStates[nodeId] = { ...this.newStates[nodeId], ...newState };
    } else {
      this.newStates[nodeId] = newState;
    }
  }

  private onTrigger = (from: ParamAddress): void => {
    this.links.getLinkedInputs(from).forEach((to) => {
      this.dirtyTriggers.add(from, to);
    });
  }

  private onOutputDelete = (address: ParamAddress): void => {
    this.links.removeLinksForOutput(address);
  }

  private onParameterDelete = (address: ParamAddress): void => {
    this.links.removeLinksForInput(address);
  }

  addNode(node: Node): void {
    node.on(Event.TRIGGER, this.onTrigger);
    node.on(Event.OUTPUT_REMOVED, this.onOutputDelete);
    node.on(Event.PARAMETER_REMOVED, this.onParameterDelete);

    // TODO: add other triggers

    this.nodes[node.id] = node;
    node.nodeDidCreate && node.nodeDidCreate();
  }

  removeNode(nodeId: string): void {
    if (nodeId in this.nodes) {
      const node = this.nodes[nodeId];

      node.nodeWillBeDestroyed && node.nodeWillBeDestroyed();
      node.removeAllListeners();

      this.links.removeLinksForNode(nodeId);

      delete this.nodes[nodeId];
    }
  }

  private checkNode(nodeId: string, shouldExist: boolean): void {
    if (nodeId in this.nodes === shouldExist) {
      return;
    }

    if (shouldExist === true) {
      throw `Node ${nodeId} doesn't exist`;
    } else {
      throw `Node ${nodeId} is already exist`;
    }
  }

  private checkOutputAddress([nodeId, portId]: ParamAddress): void {
    this.checkNode(nodeId, true);
    this.nodes[nodeId].checkOutput(portId, true);
  }

  private checkParameterAddress([nodeId, portId]: ParamAddress): void {
    this.checkNode(nodeId, true);
    this.nodes[nodeId].checkParameter(portId, true);
  }

  private isValued([nodeId, portId]: ParamAddress): boolean {
    return nodeId in this.nodes && this.nodes[nodeId].isValued(portId);
  }

  private isTrigger([nodeId, portId]: ParamAddress): boolean {
    return nodeId in this.nodes && this.nodes[nodeId].isTrigger(portId);
  }

  addLink(from: ParamAddress, to: ParamAddress): void {
    this.checkOutputAddress(from);
    this.checkParameterAddress(to);

    this.links.add(from, to);

    // Send value from valued output exact after connecting
    if (this.isValued(from)) {
      this.dirtyTriggers.add(from, to);
    }
  }

  removeLink(from: ParamAddress, to: ParamAddress): void {
    this.links.remove(from, to);
  }

  private commitChanges(): void {
    const newStates = this.newStates;
    this.newStates = {};

    for (const nodeId in newStates) {
      const diff = newStates[nodeId];
      if (nodeId in this.nodes) {
        const node = this.nodes[nodeId];
        const prevState = node.state;
        const newState = { ...prevState, ...diff };
        node.nodeWillUpdate && node.nodeWillUpdate(newState);
        node.commitChanges(newState);
        node.nodeDidUpdate && node.nodeDidUpdate(prevState);
      }
    }
  }

  private triggerLinks(): void {
    const dirtyTriggers = this.dirtyTriggers;
    this.dirtyTriggers = new Links();

    for (const [from, to] of dirtyTriggers) {
      if (this.isTrigger(to)) {
        this.nodes[to[0]].trigger(to[1]);
      } else if (this.isValued(from) && this.isValued(to)) {
        this.addToNodeState(to[0], {
          [to[1]]: this.nodes[from[0]].getOutputValue(from[1]),
        });
      }
    }
  }

  tick(): void {
    this.commitChanges();
    this.triggerLinks();
  }

  reset(): void {
    this.dirtyTriggers.clear();
    this.newStates = {};
    this.links.clear();
    this.nodes = {};
  }
}
