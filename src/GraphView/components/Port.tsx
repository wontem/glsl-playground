import * as React from 'react';
import { observer } from 'mobx-react';

import { PORT_WIDTH, PORT_HEIGHT } from '../constants';
import { PortStore } from '../stores/PortStore';

interface PortProps {
  port: PortStore;
  onMouseDown: (e: React.MouseEvent, item: any) => void;
  onMouseUp: (e: React.MouseEvent, item: any) => void;
  onMouseEnter: (e: React.MouseEvent, item: any) => void;
  onMouseLeave: (e: React.MouseEvent, item: any) => void;
  isDisabled?: boolean;
  forceColor?: string;
}

@observer
export class Port extends React.Component<PortProps, never> {
  render() {
    const { port, isDisabled } = this.props;

    return (
      <rect
        x={port.relX - PORT_WIDTH / 2}
        y={port.relY - PORT_HEIGHT / 2}
        width={PORT_WIDTH}
        height={PORT_HEIGHT}
        fill={this.props.forceColor || (isDisabled ? '#333' : port.color)}
        onMouseDown={(e) => this.props.onMouseDown(e, port)}
        onMouseUp={(e) => !isDisabled && this.props.onMouseUp(e, port)}
        onMouseEnter={(e) => !isDisabled && this.props.onMouseEnter(e, port)}
        onMouseLeave={(e) => !isDisabled && this.props.onMouseLeave(e, port)}
      />
      // <circle
      //   cx={port.relX}
      //   cy={port.relY}
      //   r={PORT_WIDTH / 2}
      //   fill={isDisabled ? '#333' : port.color}
      //   onMouseDown={(e) => this.props.onMouseDown(e, port)}
      //   onMouseUp={(e) => !isDisabled && this.props.onMouseUp(e, port)}
      //   onMouseEnter={(e) => !isDisabled && this.props.onMouseEnter(e, port)}
      //   onMouseLeave={(e) => !isDisabled && this.props.onMouseLeave(e, port)}
      // />
    );
  }
}
