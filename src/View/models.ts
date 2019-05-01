export enum ViewEventType {
  CREATE_SHADER,
  CREATE_PROGRAM,
}

export interface ViewEvent {
  type: ViewEventType;
  message: string | null;
}

export type UniformValues = Record<string, number[]>;

export interface UniformInfo {
  name: string;
  type: number;
  location: WebGLUniformLocation;
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
  BLUR,
}

export enum Wrap {
  CLAMP,
  REPEAT,
  MIRROR,
}

export interface TextureState {
  source:
    | ImageBitmap
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement;
  resolution: Resolution;
  flipY: boolean;
  filter: Filter;
  wrap: [Wrap, Wrap];
}

export interface ReadonlyTexture {
  getResolution(): Resolution;
  getUnit(): number;
}

export type Resolution = [number, number];

// export interface Config {
//   textures: string[];
//   buffers: string[];
//   resolution: Resolution;
//   buffersOrder: string[];
// }
