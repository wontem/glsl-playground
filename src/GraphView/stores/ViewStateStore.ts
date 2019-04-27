import { action, computed, observable } from 'mobx';

import {
  CENTER_PADDING,
  MAX_SCALE,
  MIN_SCALE,
  PortType,
  Tool,
  ZOOM_FACTOR,
} from '../constants';
import { clamp } from '../helpers/clamp';
import { fork } from '../helpers/fork';
import { GraphStore } from './GraphStore';
import { NodeStore } from './NodeStore';
import { PortalPortStore } from './PortalPortStore';
import { PortStore } from './PortStore';
import { TempPortStore } from './TempPortStore';

export class ViewStateStore {
  @observable private graphStack: GraphStore[];
  @computed get graph(): GraphStore {
    return this.graphStack[this.graphStack.length - 1];
  }

  @action pushGraph(graph: GraphStore): void {
    this.resetDragState();
    this.resetSelectionBox();
    this.selectedNodes.clear();
    this.graphStack.push(graph);
  }

  @action popGraph(): void {
    if (this.graphStack.length > 1) {
      this.resetDragState();
      this.resetSelectionBox();
      this.selectedNodes.clear();
      this.graphStack.pop();
    }
  }

  constructor(initialGraph: GraphStore) {
    this.graphStack = [initialGraph];
  }

  @observable tool: Tool = Tool.SELECT;

  @observable isSelectionActive: boolean = false;
  @observable private selectionFrom: [number, number] | null = null;
  @observable private selectionTo: [number, number] | null = null;

  @observable hoveredItem: any;

  @computed get selectionStart(): [number, number] {
    return [
      Math.min(this.selectionFrom![0], this.selectionTo![0]),
      Math.min(this.selectionFrom![1], this.selectionTo![1]),
    ];
  }

  @computed get selectionSize(): [number, number] {
    return [
      Math.abs(this.selectionTo![0] - this.selectionFrom![0]),
      Math.abs(this.selectionTo![1] - this.selectionFrom![1]),
    ];
  }

  @observable width: number = 0;
  @observable height: number = 0;
  @observable private _scale: number = 1;

  @observable selectedNodes: Set<NodeStore> = new Set();
  @observable draggingItem: any;

  @observable translateX: number = 0;
  @observable translateY: number = 0;

  @observable isMouseDown: boolean = false;
  @observable isDragging: boolean = false;
  @observable prevMousePos!: [number, number];

  @computed get scale(): number {
    return this._scale;
  }

  @computed get viewBox(): string {
    return `${this.translateX} ${this.translateY} ${this.width /
      this.scale} ${this.height / this.scale}`;
  }

  toCanvasCoordinate([x, y]: [number, number]): [number, number] {
    return [x / this.scale + this.translateX, y / this.scale + this.translateY];
  }

  set scale(scale: number) {
    this._scale = clamp(MIN_SCALE, MAX_SCALE, scale);
  }

  @action onMouseEnter(item: any) {
    if (this.isDragging) {
      return;
    }

    fork(item, {
      port: (port) => (this.hoveredItem = port),
      link: (link) => (this.hoveredItem = link),
      node: (node) => (this.hoveredItem = node),
    });
  }

  @action onMouseLeave(item?: any) {
    if (this.isDragging) {
      return;
    }

    this.hoveredItem = null;
  }

  @action resetDragState() {
    this.isDragging = false;
    this.isMouseDown = false;
    this.draggingItem = null;
  }

  @action onMouseMove(currentMousePos: [number, number]) {
    if (!this.isMouseDown) {
      return;
    }

    this.isDragging = true;

    const [translateX, translateY] = [
      (currentMousePos[0] - this.prevMousePos[0]) / this.scale,
      (currentMousePos[1] - this.prevMousePos[1]) / this.scale,
    ];

    fork(this.draggingItem, {
      node: () => {
        this.selectedNodes.forEach((node) => {
          node.x += translateX;
          node.y += translateY;
        });
      },
      default: () => {
        if (this.tool === Tool.PAN) {
          this.translateX -= translateX;
          this.translateY -= translateY;
        } else if (this.tool === Tool.SELECT && this.isSelectionActive) {
          this.selectionTo = this.toCanvasCoordinate(currentMousePos);

          this.selectedNodes.clear();

          this.graph.nodes.forEach((node) => {
            if (
              this.selectionStart[0] < node.x + node.width &&
              this.selectionStart[1] < node.y + node.height &&
              this.selectionStart[0] + this.selectionSize[0] > node.x &&
              this.selectionStart[1] + this.selectionSize[1] > node.y
            ) {
              this.selectedNodes.add(node);
            }
          });
        }
      },
    });

    this.prevMousePos = currentMousePos;
  }

  @action onZoom(mousePosition: [number, number], delta: number) {
    const [cX, cY] = this.toCanvasCoordinate(mousePosition);
    const oldScale = this.scale;

    this.scale =
      delta < 0 ? this.scale * ZOOM_FACTOR : this.scale / ZOOM_FACTOR;

    this.translateX = ((this.translateX - cX) * oldScale) / this.scale + cX;
    this.translateY = ((this.translateY - cY) * oldScale) / this.scale + cY;
  }

  @action onMouseDown(
    mousePos: [number, number],
    item?: any,
    shouldAdd?: boolean,
  ): void {
    this.isMouseDown = true;
    this.prevMousePos = mousePos;

    fork(item, {
      link: (link) => {
        link.delete();
      },
      node: (node) => {
        this.draggingItem = node;

        if (shouldAdd) {
          this.selectedNodes.has(node)
            ? this.selectedNodes.delete(node)
            : this.selectedNodes.add(node);
        } else if (!this.selectedNodes.has(node)) {
          this.selectedNodes.clear();
          this.selectedNodes.add(node);
        }
      },
      port: (port) => {
        this.draggingItem = port;
      },
      default: () => {
        if (this.tool === Tool.SELECT) {
          this.selectionFrom = this.toCanvasCoordinate(mousePos);
          this.selectionTo = this.selectionFrom;
          this.isSelectionActive = true;
        }

        this.selectedNodes.clear();
      },
    });
  }

  @action onMouseUp(mousePos: [number, number], item?: any): void {
    // TODO: non-view-state side-effects
    fork(item, {
      // node: (node) => {
      //   if (!this.isDragging && this.selectedNodes.size > 1 && this.selectedNodes.has(node)) {
      //     this.selectedNodes.clear();
      //     this.selectedNodes.add(node);
      //   }
      // },
      port: (port) => {
        if (
          this.draggingItem instanceof PortStore &&
          this.draggingItem.type !== port.type
        ) {
          if (port instanceof TempPortStore) {
            const portalsPair = PortalPortStore.createPortalsPair(
              port.type === PortType.INPUT ? port.node : port.node.group,
              port.type === PortType.INPUT ? port.node.group : port.node,
              this.draggingItem.dataType,
            );

            const from =
              this.draggingItem.type === PortType.OUTPUT
                ? this.draggingItem
                : portalsPair.output;
            const to =
              this.draggingItem.type === PortType.INPUT
                ? this.draggingItem
                : portalsPair.input;

            from.link(to);
          } else if (
            this.draggingItem.dataType === port.dataType &&
            !this.draggingItem.isLinked(port)
          ) {
            const from =
              this.draggingItem.type === PortType.OUTPUT
                ? this.draggingItem
                : port;
            const to =
              this.draggingItem.type === PortType.INPUT
                ? this.draggingItem
                : port;

            from.link(to);
          }
        }
      },
      default: () => {
        // if (!this.isDragging) {
        //   this.selectedNode = null;
        // }
      },
    });

    this.resetDragState();
    this.resetSelectionBox();
  }

  @action resetSelectionBox() {
    this.selectionFrom = null;
    this.selectionTo = null;
    this.isSelectionActive = false;
  }

  @action centerBox = (
    box: Record<'width' | 'height' | 'x' | 'y', number>,
  ): void => {
    const width = box.width + CENTER_PADDING * 2;
    const height = box.height + CENTER_PADDING * 2;

    this.scale = Math.min(this.width / width, this.height / height);

    this.translateX =
      box.x - CENTER_PADDING - (this.width / this.scale - width) / 2;
    this.translateY =
      box.y - CENTER_PADDING - (this.height / this.scale - height) / 2;
  }
}
