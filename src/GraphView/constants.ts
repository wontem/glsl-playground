export const CENTER_PADDING = 20;
export const ZOOM_FACTOR = 1.1;
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2;

export const NODE_HEIGHT = 30;
export const NODE_MIN_WIDTH = 100;

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
}

export enum NodeType {
  DEFAULT,
  GROUP,
  GROUP_INPUTS,
  GROUP_OUTPUTS,
  OP,
}
