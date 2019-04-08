import { observable, action, computed } from 'mobx';

import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { LinkStore } from './LinkStore';
import { PortType, NodeType } from '../constants';
import { NodeTemplate } from '../types';

export class GraphStore {
  @observable nodes: Map<string, NodeStore> = new Map();
  @observable links: Map<string, LinkStore> = new Map();

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
    return this.portToPorts.has(portA) && this.portToPorts.get(portA).has(portB);
  }

  @action addLink(fromPort: PortStore, toPort: PortStore): void {
    const link = new LinkStore(
      this,
      fromPort as PortStore<PortType.OUTPUT>, // TODO: fix types
      toPort as PortStore<PortType.INPUT>,
    );

    this.links.set(link.id, link);
  }

  @action addNodeFromTemplate(x: number, y: number, template: NodeTemplate): NodeStore {
    const node = NodeStore.fromTemplate(this, template);
    node.x = x - node.width / 2;
    node.y = y - node.height / 2;
    node.label = node.id.slice(0, 8);

    this.nodes.set(node.id, node);

    return node;
  }

  @action addNode(x: number, y: number, node: NodeStore): NodeStore {
    // TODO: pass graph
    node.x = x - node.width / 2;
    node.y = y - node.height / 2;
    node.label = node.id.slice(0, 8);

    this.nodes.set(node.id, node);

    return node;
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

    nodes.forEach(node => node.delete());

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

    const groupNode = new NodeStore(this, NodeType.GROUP);

    externalInputLinks.forEach(link => {
      const dataType = link.out.dataType;

      const port = new PortStore(this, groupNode, PortType.INPUT, dataType);
      groupNode.addPort(port);

      this.addLink(link.in, port);
    });

    externalOutputLinks.forEach(link => {
      const dataType = link.in.dataType;

      const port = new PortStore(this, groupNode, PortType.OUTPUT, dataType);
      groupNode.addPort(port);

      this.addLink(port, link.out);
    });

    this.addNode((box.xl + box.xr) / 2, (box.yb + box.yt) / 2, groupNode);

    console.log(internalLinks, externalInputLinks, externalOutputLinks);
  }
}
