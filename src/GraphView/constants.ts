export const CENTER_PADDING = 20;
export const ZOOM_FACTOR = 1.1;
export const MIN_SCALE = .5;
export const MAX_SCALE = 2;

export const NODE_HEIGHT = 30;

export const PORT_WIDTH = 10;
export const PORT_HEIGHT = 6;
export const PORT_STEP = 2;

export const WIRE_WIDTH = 2;

export enum Tool {
  SELECT,
  PAN,
}

export enum PortType {
  INPUT,
  OUTPUT,
};

export enum NodeType {
  DEFAULT,
  GROUP,
  GROUP_INPUTS,
  GROUP_OUTPUTS,
}

// export enum LinkType {
//   CONNECTION,
//   EXTENSION,
// }

export enum PortDataType {
  TRIGGER = 'trigger',
  TEXTURE = 'texture',
  BOOL = 'bool',
  FLOAT = 'float',
  INT = 'int',
  VEC2 = 'vec2',
  VEC3 = 'vec3',
  VEC4 = 'vec4',
};

const step = 360 / 8;

export const PortColors: Record<PortDataType, string> = {
  [PortDataType.TRIGGER]: `hsl(${step * 0 - 10}, 100%, 60%)`,
  [PortDataType.TEXTURE]: `hsl(${step * 1 - 10}, 100%, 60%)`,
  [PortDataType.BOOL]: `hsl(${step * 2 - 10}, 100%, 60%)`,
  [PortDataType.FLOAT]: `hsl(${step * 3 - 10}, 100%, 60%)`,
  [PortDataType.INT]: `hsl(${step * 4 - 10}, 100%, 60%)`,
  [PortDataType.VEC2]: `hsl(${step * 5 - 10}, 100%, 60%)`,
  [PortDataType.VEC3]: `hsl(${step * 6 - 10}, 100%, 60%)`,
  [PortDataType.VEC4]: `hsl(${step * 7 - 10}, 100%, 60%)`,
};
