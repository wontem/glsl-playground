import { observable, computed } from 'mobx';
import { clamp } from '../../helpers/clamp';
import { MIN_SCALE, MAX_SCALE, ZOOM_FACTOR } from '../../constants';

export class PanZoom {
  @observable private _scale: number = 1;

  @computed get scale(): number {
    return this._scale;
  }

  set scale(scale: number) {
    this._scale = clamp(MIN_SCALE, MAX_SCALE, scale);
  }

  @observable translateX: number = 0;
  @observable translateY: number = 0;

  mouseDown() {

  }

  mouseUp() {

  }

  mouseMove() {

  }

  toCanvasCoordinate([x, y]: [number, number]): [number, number] {
    return [
      x / this.scale + this.translateX,
      y / this.scale + this.translateY,
    ];
  }

  getViewBox(width: number, height: number): string {
    return `${this.translateX} ${this.translateY} ${width / this.scale} ${height / this.scale}`;
  }

  zoom(toPoint: [number, number], delta: number) {
    const [cX, cY] = this.toCanvasCoordinate(toPoint);
    const oldScale = this.scale;

    this.scale = delta < 0 ? this.scale * ZOOM_FACTOR : this.scale / ZOOM_FACTOR;

    this.translateX = (this.translateX - cX) * oldScale / this.scale + cX;
    this.translateY = (this.translateY - cY) * oldScale / this.scale + cY;
  }
}
