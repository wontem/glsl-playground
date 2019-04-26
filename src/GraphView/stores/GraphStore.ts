import { observable, action, computed } from 'mobx';

import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { LinkStore } from './LinkStore';
import { PortType, NODE_HEIGHT } from '../constants';
import { GroupStore } from './GroupStore';
import { PortalPortStore } from './PortalPortStore';

export interface GraphStoreConfig {
  colors: Record<string, string>;
}

export class GraphStore {
  readonly config: Readonly<GraphStoreConfig>;
  @observable nodes: Map<string, NodeStore> = new Map();
  @observable links: Map<string, LinkStore> = new Map();

  constructor(config?: Partial<GraphStoreConfig>) {
    this.config = {
      colors: {},
      ...config,
    };
  }

  // TODO: refactor all this shit related to links
  @computed get portToLinks(): Map<PortStore, Set<LinkStore>> {
    const portLinks = new Map<PortStore, Set<LinkStore>>();

    const addLink = (port: PortStore, link: LinkStore): void => {
      const linksSet = portLinks.get(port) || new Set();
      linksSet.add(link);
      portLinks.set(port, linksSet);
    };

    this.links.forEach((link) => {
      addLink(link.in, link);
      addLink(link.out, link);
    });

    return portLinks;
  }

  @computed get portToPorts(): Map<PortStore, Set<PortStore>> {
    const portToPorts = new Map<PortStore, Set<PortStore>>();

    this.portToLinks.forEach((links, port) => {
      const portsSet: Set<PortStore> = new Set();

      links.forEach((link) => {
        portsSet.add(port.type === PortType.INPUT ? link.in : link.out);
      });

      portToPorts.set(port, portsSet);
    });

    return portToPorts;
  }

  checkPortsLink(portA: PortStore, portB: PortStore): boolean {
    return this.portToPorts.has(portA) && this.portToPorts.get(portA)!.has(portB);
  }

  @action bindNode(node: NodeStore): void {
    if (node.graph && node.graph !== this) {
      this.unbindNode(node);
    }

    node.graph = this;
    this.nodes.set(node.id, node);
  }

  @action unbindNode(node: NodeStore): void {
    node.ports.forEach(port => {
      port.unlinkAll();
    });

    node.graph!.nodes.delete(node.id);
    node.graph = undefined;
  }

  @action addLink(fromPort: PortStore<PortType.OUTPUT>, toPort: PortStore<PortType.INPUT>): void {
    const link = new LinkStore(fromPort, toPort);

    link.graph = this;

    this.links.set(link.id, link);
  }

  @action groupNodes(nodes: Set<NodeStore>): void {
    const internalLinks: LinkStore[] = [];
    const externalInputLinks: LinkStore[] = [];
    const externalOutputLinks: LinkStore[] = [];

    this.links.forEach((link) => {
      const isOutputInGroup = nodes.has(link.in.node);
      const isInputInGroup = nodes.has(link.out.node);
      if (isOutputInGroup && isInputInGroup) {
        internalLinks.push(link);
      } else if (isInputInGroup) {
        externalInputLinks.push(link);
      } else if (isOutputInGroup) {
        externalOutputLinks.push(link);
      }
    });

    const box = {
      xl: Infinity,
      yt: Infinity,
      xr: -Infinity,
      yb: -Infinity,
    };

    nodes.forEach(node => {
      box.xl = Math.min(node.x, box.xl);
      box.yt = Math.min(node.y, box.yt);
      box.xr = Math.max(node.x + node.width, box.xr);
      box.yb = Math.max(node.y + node.height, box.yb);
    });

    const groupNode = new GroupStore(this.config);
    this.bindNode(groupNode);

    groupNode.inputsNode.center = [(box.xl + box.xr) / 2, box.yt - NODE_HEIGHT * 2];
    groupNode.outputsNode.center = [(box.xl + box.xr) / 2, box.yb + NODE_HEIGHT * 2];

    nodes.forEach(node => {
      groupNode.groupGraph.bindNode(node);
    });

    internalLinks.forEach(link => {
      // TODO: implement this.bindLink()
      groupNode.groupGraph.links.set(link.id, link);
      link.graph = groupNode.groupGraph;
    });

    externalInputLinks.forEach(link => {
      const dataType = link.out.dataType;

      const externalPort = new PortalPortStore(groupNode, PortType.INPUT, dataType);
      groupNode.addPort(externalPort);
      link.in.link(externalPort);

      const internalPort = new PortalPortStore(groupNode.inputsNode, PortType.OUTPUT, dataType);
      groupNode.inputsNode.addPort(internalPort);
      internalPort.link(link.out);

      groupNode.portPortals.set(internalPort, externalPort);
      groupNode.portPortals.set(externalPort, internalPort);
    });

    externalOutputLinks.forEach(link => {
      const dataType = link.in.dataType;

      const externalPort = new PortalPortStore(groupNode, PortType.OUTPUT, dataType);
      groupNode.addPort(externalPort);
      externalPort.link(link.out);

      const internalPort = new PortalPortStore(groupNode.outputsNode, PortType.INPUT, dataType);
      groupNode.outputsNode.addPort(internalPort);
      link.in.link(internalPort);

      // TODO: encapsulate portPortals
      groupNode.portPortals.set(internalPort, externalPort);
      groupNode.portPortals.set(externalPort, internalPort);
    });

    groupNode.center = [(box.xl + box.xr) / 2, (box.yb + box.yt) / 2];
  }

  @action unGroupNode(groupNode: GroupStore): void {

  }

  @action unGroupNodes(nodes: Set<NodeStore>): void {
    [...nodes].filter(node => node instanceof GroupStore).forEach(node => this.unGroupNode(node as GroupStore));
  }
}
