import * as React from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { HotKeys } from './HotKeys';

import { Node } from './Node';
import { Link } from './Link';
import { LinkRaw } from './LinkRaw';
import { PortType, Tool, NodeType } from '../constants';
import { ViewStateStore } from '../stores/ViewStateStore';
import { PortStore } from '../stores/PortStore';
import { PrioritizedArray } from '../helpers/PrioritizedArray';
import { fork } from '../helpers/fork';
import { GroupStore } from '../stores/GroupStore';
import { OpAnimationLoop, OpLogger, OpCounter, OpLifeCycle } from '../operator/OpLifeCycle';

interface Props {
  viewState: ViewStateStore; // TODO: maybe move to Patch as property
}

@observer
export class Patch extends React.Component<Props> {
  private svgElement: React.RefObject<SVGSVGElement> = React.createRef();

  mouseCoordinate(e: React.MouseEvent): [number, number] {
    const rect = this.svgElement.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return [x, y];
  }

  @action onDoubleClick = (e: React.MouseEvent, item?: any) => {
    e.stopPropagation();

    fork(item, {
      node: (node) => {
        switch (node.type) {
          case NodeType.GROUP: {
            this.props.viewState.pushGraph((node as GroupStore).groupGraph);
            break;
          }
        }
      },
      default: () => {
        const OpConstructor = [OpAnimationLoop, OpLogger, OpCounter][Math.floor(Math.random() * 3)];
        const op = new OpConstructor();
        // const node = NodeStore.fromTemplate(templates[Math.floor(Math.random() * templates.length)]);
        op.node.center = this.props.viewState.toCanvasCoordinate(this.mouseCoordinate(e));
        this.props.viewState.graph.bindNode(op.node);

        // this.props.viewState.draggingItem = node;
        // this.props.viewState.selectedNodes.clear();
        // this.props.viewState.selectedNodes.add(node);
        // this.props.viewState.isMouseDown = true;
        // this.props.viewState.isDragging = true;
      },
    });
  }

  @action onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    // TODO: Unable to preventDefault inside passive event listener due to target being treated as passive.
    // e.preventDefault();
    this.props.viewState.onZoom(this.mouseCoordinate(e), e.deltaY);
  }

  @action onMouseEnter = (e: React.MouseEvent, item?: any) => {
    this.props.viewState.onMouseEnter(item);
  }

  @action onMouseLeave = (e: React.MouseEvent, item?: any) => {
    this.props.viewState.onMouseLeave(item);
  }

  @action onMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    this.props.viewState.onMouseMove(this.mouseCoordinate(e));
  }

  @action onMouseDown = (e: React.MouseEvent, item?: any): void => {
    e.stopPropagation();
    this.props.viewState.onMouseDown(this.mouseCoordinate(e), item, e.shiftKey);
  }

  @action onMouseUp = (e: React.MouseEvent, item?: any): void => {
    e.stopPropagation();
    this.props.viewState.onMouseUp(this.mouseCoordinate(e), item);
  }

  renderTempLink(): JSX.Element | undefined {
    if (this.props.viewState.isDragging && this.props.viewState.draggingItem instanceof PortStore) {
      const port = this.props.viewState.draggingItem;
      const from: [number, number] = [port.x, port.y];
      const to: [number, number] = this.props.viewState.toCanvasCoordinate(this.props.viewState.prevMousePos);

      return port.type === PortType.OUTPUT ? (
        <LinkRaw fromPoint={from} toPoint={to} color={port.color} ignorePointerEvents />
      ) : (
          <LinkRaw fromPoint={to} toPoint={from} color={port.color} ignorePointerEvents />
      );
    }
  }

  render() {
    const nodes: PrioritizedArray<JSX.Element, number> = new PrioritizedArray();
    const links: PrioritizedArray<JSX.Element, number> = new PrioritizedArray();
    const shouldDisableLinks = this.props.viewState.isMouseDown && this.props.viewState.draggingItem instanceof PortStore;

    this.props.viewState.graph.nodes.forEach((node, id) => {
      const isSelected = this.props.viewState.selectedNodes.has(node);
      nodes.push(isSelected ? 1 : 0,
        <Node
          key={id}
          node={node}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onDoubleClick={this.onDoubleClick}
          currentItem={this.props.viewState.draggingItem}
          isSelected={isSelected}
        />
      );
    });

    this.props.viewState.graph.links.forEach((link, id) => {
      const selectedNodes = this.props.viewState.selectedNodes;
      const isHovered = this.props.viewState.hoveredItem === link;
      const isHighlighted = !shouldDisableLinks && (selectedNodes.size === 0 || selectedNodes.has(link.out.node) || selectedNodes.has(link.in.node));

      links.push(isHovered ? 2 : isHighlighted ? 1 : 0,
        <Link
          key={id}
          link={link}
          isHovered={isHovered}
          isHighlighted={isHighlighted}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onMouseDown={this.onMouseDown}
        />
      );
    });

    const tempLink = this.renderTempLink();

    return (
      <HotKeys keyMap={{
        center: 'c',
        delete: ['del', 'backspace'],
        changeTool: 't',
        groupNodes: 'cmd+g',
        popGraph: 'escape',
      }} handlers={{
        center: action(() => this.props.viewState.centerBox(this.svgElement.current!.getBBox())),
        delete: action(() => {
          this.props.viewState.selectedNodes.forEach(node => {
            OpLifeCycle.opLifeCycles.get(node)!.destroy(); // FIXME: deleting of groups leads to critical
          });
          this.props.viewState.selectedNodes.clear();
        }),
        changeTool: action(() => {
          this.props.viewState.tool = this.props.viewState.tool === Tool.PAN ? Tool.SELECT : Tool.PAN;
        }),
        groupNodes: action((e: any) => {
          e.preventDefault();
          if (this.props.viewState.selectedNodes.size > 1) {
            this.props.viewState.graph.groupNodes(this.props.viewState.selectedNodes);
            this.props.viewState.resetDragState();
            this.props.viewState.resetSelectionBox();
            this.props.viewState.selectedNodes.clear();
          }
        }),
        popGraph: action(() => {
          this.props.viewState.popGraph();
        }),
      }} style={{
        position: 'absolute',
        outline: 'none',
      }}
      >
        <svg
          style={{
            position: 'relative',
            // border: '2px solid',
            boxSizing: 'border-box',
            userSelect: 'none',
            background: '#111',
          }}
          ref={this.svgElement}
          viewBox={this.props.viewState.viewBox}
          preserveAspectRatio='none'
          width={this.props.viewState.width}
          height={this.props.viewState.height}

          onDoubleClick={this.onDoubleClick}
          onWheel={this.onWheel}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
        >
          {links.toArray()}
          {tempLink}
          {nodes.toArray()}
          {this.props.viewState.isSelectionActive ? (
            <rect
              x={this.props.viewState.selectionStart[0]}
              y={this.props.viewState.selectionStart[1]}
              width={this.props.viewState.selectionSize[0]}
              height={this.props.viewState.selectionSize[1]}
              fill='hsla(0, 0%, 100%, .3)'
              stroke='hsla(0, 0%, 100%, 1)'
              strokeWidth={1}
              pointerEvents='none'
            />
          ) : null}
        </svg>
      </HotKeys>
    );
  }
};
