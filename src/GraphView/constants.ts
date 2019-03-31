export const CENTER_PADDING = 20;
export const ZOOM_FACTOR = 1.1;
export const MIN_SCALE = .5;
export const MAX_SCALE = 2;

export const NODE_HEIGHT = 30;

export const PORT_WIDTH = 10;
export const PORT_HEIGHT = 6;
export const PORT_STEP = 2;

export enum PortType {
  INPUT,
  OUTPUT,
};

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
  [PortDataType.TRIGGER]: `hsl(${step * 0 + 20}, 100%, 50%)`,
  [PortDataType.TEXTURE]: `hsl(${step * 1 + 20}, 100%, 50%)`,
  [PortDataType.BOOL]: `hsl(${step * 2 + 20}, 100%, 50%)`,
  [PortDataType.FLOAT]: `hsl(${step * 3 + 20}, 100%, 50%)`,
  [PortDataType.INT]: `hsl(${step * 4 + 20}, 100%, 50%)`,
  [PortDataType.VEC2]: `hsl(${step * 5 + 20}, 100%, 50%)`,
  [PortDataType.VEC3]: `hsl(${step * 6 + 20}, 100%, 50%)`,
  [PortDataType.VEC4]: `hsl(${step * 7 + 20}, 100%, 50%)`,
};
