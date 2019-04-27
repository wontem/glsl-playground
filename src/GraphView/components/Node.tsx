import * as React from 'react';
import { observer } from 'mobx-react';
// import { observable } from 'mobx';

import { NodeStore } from '../stores/NodeStore';
import { Port } from './Port';
import { PortStore } from '../stores/PortStore';
import { NodeType, PortType, PORT_HEIGHT, NODE_HEIGHT, PORT_WIDTH } from '../constants';
import { GroupIOStore } from '../stores/GroupIOStore';
import { IconBaseProps } from 'react-icons';
import { MdSettingsInputComposite, MdCallReceived, MdCallMade } from 'react-icons/md';
import { GroupStore } from '../stores/GroupStore';

// import { DragSource } from 'react-dnd';

interface Props {
  node: NodeStore;
  onMouseDown: (e: React.MouseEvent, item: any) => void;
  onMouseUp: (e: React.MouseEvent, item: any) => void;
  onMouseEnter: (e: React.MouseEvent, item: any) => void;
  onMouseLeave: (e: React.MouseEvent, item: any) => void;
  onDoubleClick: (e: React.MouseEvent, item: any) => void;
  currentItem: any;
  isSelected?: boolean;
}

@observer
export class Node extends React.Component<Props, never> {
  textRef: React.RefObject<SVGTextElement> = React.createRef();

  // TODO: optimize it
  componentDidMount() {
    this.props.node.textWidth = this.textRef.current!.getBBox().width;
  }

  // TODO: optimize it
  componentDidUpdate() {
    this.props.node.textWidth = this.textRef.current!.getBBox().width;
  }

  getIconComponent(): React.ComponentType<IconBaseProps> | undefined {
    const { node } = this.props;

    if (node instanceof GroupIOStore) {
      if (node.type === NodeType.GROUP_INPUTS) {
        return MdCallReceived;
      } else if (node.type === NodeType.GROUP_OUTPUTS) {
        return MdCallMade;
      }
    } else if (node instanceof GroupStore) {
      return MdSettingsInputComposite;
    }
  }

  renderDecorativeItems(): JSX.Element {
    const {node} = this.props;
    const Icon = this.getIconComponent();

    const line = node instanceof GroupIOStore ? (
      <rect
        y={node.type === NodeType.GROUP_INPUTS ? -PORT_HEIGHT / 2 : NODE_HEIGHT}
        width={node.width}
        height={PORT_HEIGHT / 2}
        fill={'#29B6F6'}
      />
    ) : null;

    return (
      <>
        {line}
        {
          Icon && <Icon
            size={node.height / 2}
            x={node.width - node.height / 4}
            y={node.height / 4}
            color={'#29B6F6'}
          />
        }
      </>
    );
  }

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
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
          isDisabled={!isEnabled}
        />
      );
    });

    if (
      currentItem instanceof PortStore &&
      node instanceof GroupIOStore &&
      !(currentItem.node instanceof GroupIOStore) &&
      currentItem.node !== node &&
      (
        (node.type === NodeType.GROUP_INPUTS && currentItem.type === PortType.INPUT) ||
        (node.type === NodeType.GROUP_OUTPUTS && currentItem.type === PortType.OUTPUT)
      )
    ) {
      ports.push(
        <Port
          key={node.tempPort.id}
          port={node.tempPort}
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp}
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
          forceColor={currentItem.color}
        />
      );
    }

    const transformString = `translate(${node.x} ${node.y})`;

    // const style = isSelected ? {
    //   outlineColor: 'white',
    //   outlineStyle: 'solid',
    //   outlineWidth: '2px',
    //   outlineOffset: '-2px',
    // } : {};

    return (
      <g
        transform={transformString}
        // z={isSelected ? 4 : 3}
      >
        <rect
          width={node.width}
          height={node.height}
          fill={!isSelected ? '#37474F' : '#CFD8DC'}
          onMouseDown={(e) => this.props.onMouseDown(e, this.props.node)}
          onMouseUp={(e) => this.props.onMouseUp(e, this.props.node)}
          onMouseEnter={(e) => this.props.onMouseEnter(e, this.props.node)}
          onMouseLeave={(e) => this.props.onMouseLeave(e, this.props.node)}
          onDoubleClick={(e) => this.props.onDoubleClick(e, this.props.node)}
        />
        <text
          y={node.height / 2}
          x={PORT_WIDTH}
          alignmentBaseline="middle"
          fill={isSelected ? '#37474F' : 'white'}
          style={{
            fontFamily: 'Helvetica, sans-serif',
            pointerEvents: 'none',
            fontSize: `${node.height / 2}px`,
            fontWeight: 300,
          }}
          ref={this.textRef}
        >{node.label}</text>
        {ports}
        {this.renderDecorativeItems()}
      </g>
    );
  }
};
