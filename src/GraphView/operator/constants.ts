export enum PortDataType {
  ANY = 'any',
  TRIGGER = 'trigger',
  TEXTURE = 'texture',
  NUMBER = 'number',
  VEC2 = 'vec2',
  VEC3 = 'vec3',
  VEC4 = 'vec4',
  STRING = 'string',
}

export const PortColors: Record<PortDataType, string> = {
  [PortDataType.ANY]: 'white',
  [PortDataType.TRIGGER]: '#ef5350',
  [PortDataType.TEXTURE]: '#4CAF50',
  [PortDataType.NUMBER]: '#4DB6AC',
  [PortDataType.VEC2]: '#4DB6AC',
  [PortDataType.VEC3]: '#4DB6AC',
  [PortDataType.VEC4]: '#4DB6AC',
  [PortDataType.STRING]: '#FFC107',
};

export interface IDataTypes {
  [PortDataType.ANY]: any;
  [PortDataType.TRIGGER]: () => void;
  [PortDataType.TEXTURE]: number; // TODO: its better to use some unique id from config
  [PortDataType.NUMBER]: number;
  [PortDataType.VEC2]: [number, number];
  [PortDataType.VEC3]: [number, number, number];
  [PortDataType.VEC4]: [number, number, number, number];
  [PortDataType.STRING]: string;
}
