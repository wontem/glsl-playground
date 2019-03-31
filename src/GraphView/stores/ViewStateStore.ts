import { observable, computed, action } from 'mobx';

import { NodeStore } from './NodeStore';
import { PortStore } from './PortStore';
import { MIN_SCALE, MAX_SCALE, ZOOM_FACTOR, PortType, CENTER_PADDING } from '../constants';
import { fork } from '../helpers/fork';

const clamp = (a: number, b: number, x: number): number => x < a ? a : x > b ? b : x;

export class ViewStateStore {
  @observable width: number;
  @observable height: number;
  @observable private _scale: number = 1;

  @observable selectedNode: NodeStore = null;

  @observable draggingItem: any = null;

  @observable translateX: number = 0;
  @observable translateY: number = 0;

  @observable isMouseDown: boolean = false;
  @observable isDragging: boolean = false;
  @observable prevMousePos: [number, number];

  @computed get scale(): number {
    return this._scale;
  }

  @computed get canvasPrevMousePos(): [number, number] {
    return this.toCanvasCoordinate(this.prevMousePos);
  }

  @computed get viewBox(): string {
    return `${this.translateX} ${this.translateY} ${this.width / this.scale} ${this.height / this.scale}`;
  }

  toCanvasCoordinate([x, y]: [number, number]): [number, number] {
    return [
      x / this.scale + this.translateX,
      y / this.scale + this.translateY,
    ];
  }

  set scale(scale: number) {
    this._scale = clamp(MIN_SCALE, MAX_SCALE, scale);
  }

  @action onMouseDown(mousePos: [number, number]) {
    this.isMouseDown = true;
    this.prevMousePos = mousePos;
  }

  @action resetDragState() {
    this.isDragging = false;
    this.isMouseDown = false;
    this.draggingItem = null;
  }

  @action onMouseUp() {
    if (!this.isDragging) {
      this.selectedNode = null;
    }

    this.resetDragState();
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
      node: (node) => {
        node.x += translateX;
        node.y += translateY;
      },
      default: () => {
        this.translateX -= translateX;
        this.translateY -= translateY;
      }
    });

    this.prevMousePos = currentMousePos;
  }

  @action onZoom(mousePosition: [number, number], delta: number) {
    const [cX, cY] = this.toCanvasCoordinate(mousePosition);
    const oldScale = this.scale;

    this.scale = delta < 0 ? this.scale * ZOOM_FACTOR : this.scale / ZOOM_FACTOR;

    this.translateX = (this.translateX - cX) * oldScale / this.scale + cX;
    this.translateY = (this.translateY - cY) * oldScale / this.scale + cY;
  }

  @action onItemMouseDown(item: any): void {
    this.draggingItem = item;
  }

  @action onItemMouseUp(item: any): void {
    fork(item, {
      node: (node) => {
        if (!this.isDragging) {
          this.selectedNode = node;
        }
      },
      port: (port) => {
        if (
          this.draggingItem instanceof PortStore &&
          this.draggingItem.type !== port.type &&
          this.draggingItem.dataType === port.dataType &&
          !this.draggingItem.isLinked(port)
        ) {
          const from = this.draggingItem.type === PortType.INPUT ? port : this.draggingItem;
          const to = this.draggingItem.type === PortType.INPUT ? this.draggingItem : port;
          // TODO: non-view-state side-effect
          from.link(to);
        }
      }
    });

    this.resetDragState();
  }

  @action centerBox = (box: Record<'width' | 'height' | 'x' | 'y', number>): void => {
    const width = box.width + CENTER_PADDING * 2;
    const height = box.height + CENTER_PADDING * 2;

    this.scale = Math.min(this.width / width, this.height / height);

    this.translateX = box.x - CENTER_PADDING - (this.width / this.scale - width) / 2;
    this.translateY = box.y - CENTER_PADDING - (this.height / this.scale - height) / 2;
  }
}
