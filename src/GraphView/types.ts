interface PortTemplate {
  type: string;
  label?: string;
}

export interface NodeTemplate {
  label?: string;
  inputs: PortTemplate[];
  outputs: PortTemplate[];
}
