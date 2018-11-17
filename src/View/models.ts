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
