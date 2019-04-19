import { PortDataType } from './constants';

interface PortTemplate {
  type: PortDataType;
  label?: string;
}

export interface NodeTemplate {
  label?: string;
  inputs: PortTemplate[];
  outputs: PortTemplate[];
}
