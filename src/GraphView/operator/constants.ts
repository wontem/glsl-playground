
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

export const PortColors: Record<PortDataType, string> = {
  [PortDataType.ANY]: 'white',
  [PortDataType.TRIGGER]: '#ef5350',
  [PortDataType.TEXTURE]: '#4CAF50',
  [PortDataType.BOOL]: '#4DB6AC',
  [PortDataType.FLOAT]: '#4DB6AC',
  [PortDataType.INT]: '#4DB6AC',
  [PortDataType.VEC2]: '#4DB6AC',
  [PortDataType.VEC3]: '#4DB6AC',
  [PortDataType.VEC4]: '#4DB6AC',
  [PortDataType.STRING]: '#FFC107',
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
