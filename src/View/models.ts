export enum ViewEventType {
  CREATE_SHADER,
  CREATE_PROGRAM,
}

export interface ViewEvent {
  type: ViewEventType;
  message: string;
}

export interface Uniform {
  name: string;
  method: string;
  value: number[];
}

export interface Attribute {
  name: string;
  data: number[];
  size: number;
}

export enum Filter {
  LINEAR,
  NEAREST,
  MIPMAP,
}

export enum Wrap {
  CLAMP,
  REPEAT,
  MIRROR,
}

export interface TextureUpdate {
  source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
  width: number;
  height: number;
  flipY: boolean;
  filter: Filter;
  wrap: [Wrap, Wrap];
}
