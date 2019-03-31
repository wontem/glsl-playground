import * as React from 'react';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';

import { NodeStore } from '../stores/NodeStore';
import { NODE_HEIGHT } from '../constants';
import { Port } from './Port';
import { PortStore } from '../stores/PortStore';

// import { DragSource } from 'react-dnd';

@observer
export class Node extends React.Component<{
  node: NodeStore;
  onMouseDown: (e: React.MouseEvent, item: any) => void;
  onMouseUp: (e: React.MouseEvent, item: any) => void;
  currentItem: any;
  isSelected?: boolean;
}, never> {
  render() {
    const { node, currentItem, isSelected } = this.props;

    const ports: JSX.Element[] = [];

    node.ports.forEach((port, id) => {
      const isEnabled = !(currentItem instanceof PortStore) || port === currentItem || (currentItem.type !== port.type && currentItem.dataType === port.dataType && !port.isLinked(currentItem));

      ports.push(
        <Port
          key={id}
          port={port}
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp}
          isDisabled={!isEnabled}
        />
      );
    });

    const transformString = `translate(${node.x} ${node.y})`;

    // const style = isSelected ? {
    //   outlineColor: 'white',
    //   outlineStyle: 'solid',
    //   outlineWidth: '2px',
    //   outlineOffset: '-2px',
    // } : {};

    return (
      <g transform={transformString}>
        <rect
          width="100"
          height={NODE_HEIGHT}
          fill={!isSelected ? '#444' : 'white'}
          onMouseDown={(e) => this.props.onMouseDown(e, this.props.node)}
          onMouseUp={(e) => this.props.onMouseUp(e, this.props.node)}
        />
        <text
          y={NODE_HEIGHT / 2}
          x={NODE_HEIGHT / 4}
          alignmentBaseline="middle"
          fill={isSelected ? '#444' : 'white'}
          style={{
            fontFamily: 'Helvetica, sans-serif',
            pointerEvents: 'none',
            fontSize: `${NODE_HEIGHT / 2}px`,
          }}
        >{node.label}</text>
        {ports}
      </g>
    );
  }
};
