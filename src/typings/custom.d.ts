declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.tmLanguage' {
  const content: string;
  export default content;
}

declare module '*.wasm' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.worker' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

interface HTMLCanvasElement extends HTMLElement {
  // ...
  transferControlToOffscreen(): OffscreenCanvas;
}

interface OffscreenCanvasRenderingContext2D extends CanvasState, CanvasTransform, CanvasCompositing, CanvasImageSmoothing, CanvasFillStrokeStyles, CanvasShadowStyles, CanvasFilters, CanvasRect, CanvasDrawPath, CanvasUserInterface, CanvasText, CanvasDrawImage, CanvasImageData, CanvasPathDrawingStyles, CanvasTextDrawingStyles, CanvasPath {
  readonly canvas: OffscreenCanvas;
}
declare var OffscreenCanvasRenderingContext2D: {
  prototype: OffscreenCanvasRenderingContext2D;
  new(): OffscreenCanvasRenderingContext2D;
}
interface OffscreenCanvas extends EventTarget {
  width: number;
  height: number;
  getContext(contextId: "2d", contextAttributes?: CanvasRenderingContext2DSettings): OffscreenCanvasRenderingContext2D | null;
}
declare var OffscreenCanvas: {
  prototype: OffscreenCanvas;
  new(width: number, height: number): OffscreenCanvas;
}
