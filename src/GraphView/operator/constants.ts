export enum PortDataType {
  ANY = 'any',
  TRIGGER = 'trigger',
  ARRAY = 'array',
  OBJECT = 'object',
  NUMBER = 'number',
  BOOL = 'bool',
  STRING = 'string',
}

export const PortColors: Record<PortDataType, string> = {
  [PortDataType.ANY]: 'white',
  [PortDataType.TRIGGER]: '#ef5350',
  [PortDataType.ARRAY]: '#FFC107',
  [PortDataType.OBJECT]: '#9575CD',
  [PortDataType.BOOL]: '#4DB6AC',
  [PortDataType.NUMBER]: '#4DB6AC',
  [PortDataType.STRING]: '#4DB6AC',
};

export interface IDataTypes {
  [PortDataType.ANY]: any;
  [PortDataType.TRIGGER]: () => void;
  [PortDataType.BOOL]: boolean;
  [PortDataType.ARRAY]: any[];
  [PortDataType.OBJECT]: {} | null;
  [PortDataType.NUMBER]: number;
  [PortDataType.STRING]: string;
}
