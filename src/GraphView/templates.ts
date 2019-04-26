import { NodeTemplate } from './types';
import { PortDataType } from './operator/constants';

export const templates: NodeTemplate[] = [
  {
    label: 'Buffer',
    inputs: [
      { type: PortDataType.TRIGGER },
      { label: 'resolution', type: PortDataType.VEC2 },
    ],
    outputs: [
      { type: PortDataType.TEXTURE }
    ]
  },
  {
    label: 'PingPong',
    inputs: [
      { type: PortDataType.TRIGGER },
      { label: 'resolution', type: PortDataType.VEC2 },
    ],
    outputs: [
      { type: PortDataType.TEXTURE }
    ]
  },
  {
    label: 'ImageLoader',
    inputs: [
    ],
    outputs: [
      { type: PortDataType.TRIGGER },
      { type: PortDataType.TEXTURE },
      { label: 'resolution', type: PortDataType.VEC2 },
    ]
  },
];
