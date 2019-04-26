
// TODO: move this from here
export enum PortDataType {
  ANY = 'any',
  TRIGGER = 'trigger',
  TEXTURE = 'texture',
  BOOL = 'bool',
  FLOAT = 'float',
  INT = 'int',
  VEC2 = 'vec2',
  VEC3 = 'vec3',
  VEC4 = 'vec4',
  STRING = 'string',
};

const step = 360 / 9;

export const PortColors: Record<PortDataType, string> = {
  [PortDataType.ANY]: 'white',
  [PortDataType.TRIGGER]: `hsl(${step * 0 - 10}, 100%, 60%)`,
  [PortDataType.TEXTURE]: `hsl(${step * 1 - 10}, 100%, 60%)`,
  [PortDataType.BOOL]: `hsl(${step * 2 - 10}, 100%, 60%)`,
  [PortDataType.FLOAT]: `hsl(${step * 3 - 10}, 100%, 60%)`,
  [PortDataType.INT]: `hsl(${step * 4 - 10}, 100%, 60%)`,
  [PortDataType.VEC2]: `hsl(${step * 5 - 10}, 100%, 60%)`,
  [PortDataType.VEC3]: `hsl(${step * 6 - 10}, 100%, 60%)`,
  [PortDataType.VEC4]: `hsl(${step * 7 - 10}, 100%, 60%)`,
  [PortDataType.STRING]: `hsl(${step * 8 - 10}, 100%, 60%)`,
};

export interface IDataTypes {
  [PortDataType.ANY]: any;
  [PortDataType.TRIGGER]: () => void;
  [PortDataType.TEXTURE]: number; // TODO: fix
  [PortDataType.BOOL]: boolean;
  [PortDataType.FLOAT]: number;
  [PortDataType.INT]: number;
  [PortDataType.VEC2]: [number, number];
  [PortDataType.VEC3]: [number, number, number];
  [PortDataType.VEC4]: [number, number, number, number];
  [PortDataType.STRING]: string;
};
