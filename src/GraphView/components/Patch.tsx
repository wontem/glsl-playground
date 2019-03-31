import * as React from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { HotKeys } from './HotKeys';

import { GraphStore } from '../stores/GraphStore';
import { Node } from './Node';
import { Link } from './Link';
import { LinkRaw } from './LinkRaw';
import { PortType } from '../constants';
import { ViewStateStore } from '../stores/ViewStateStore';
import { PortStore } from '../stores/PortStore';

const clamp = (a: number, b: number, x: number): number => x < a ? a : x > b ? b : x;

interface Props {
  graph: GraphStore;
  viewState: ViewStateStore; // TODO: maybe move to Patch as property
}

@observer
export class Patch extends React.Component<Props> {
  private svgElement: React.RefObject<SVGSVGElement> = React.createRef();

  mouseCoordinate(e: React.MouseEvent<SVGSVGElement>): [number, number] {
    const rect = this.svgElement.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return [x, y];
  }

  @action onDoubleClick: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const [x, y] = this.props.viewState.toCanvasCoordinate(this.mouseCoordinate(e));
    this.props.graph.addNode(x, y);
  }

  @action onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    this.props.viewState.onZoom(this.mouseCoordinate(e), e.deltaY);
  }

  @action onMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    this.props.viewState.onMouseDown(this.mouseCoordinate(e));
  }

  @action onMouseUp: React.MouseEventHandler<SVGSVGElement> = (e) => {
    this.props.viewState.onMouseUp();
  }

  @action onMouseLeave: React.MouseEventHandler<SVGSVGElement> = (e) => {

  }

  @action onMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    this.props.viewState.onMouseMove(this.mouseCoordinate(e));
  }

  @action onItemMouseDown = (
    e: React.MouseEvent<SVGRectElement>,
    item: any,
  ): void => {
    this.props.viewState.onItemMouseDown(item);
  }

  @action
  onItemMouseUp = (
    e: React.MouseEvent<SVGRectElement>,
    item: any,
  ): void => {
    e.stopPropagation();

    this.props.viewState.onItemMouseUp(item);
  }


  renderTempLink(): JSX.Element {
    if (this.props.viewState.isDragging && this.props.viewState.draggingItem instanceof PortStore) {
      const port = this.props.viewState.draggingItem;
      const from: [number, number] = [port.x, port.y];
      const to: [number, number] = this.props.viewState.canvasPrevMousePos;

      return port.type === PortType.OUTPUT ? (
        <LinkRaw fromPoint={from} toPoint={to} color={port.color} />
      ) : (
        <LinkRaw fromPoint={to} toPoint={from} color={port.color} />
      );
    }

    return null;
  }

  render() {
    const nodes: JSX.Element[] = [];
    const links: JSX.Element[] = [];

    const shouldDisableLinks = this.props.viewState.isMouseDown && this.props.viewState.draggingItem instanceof PortStore;

    this.props.graph.nodes.forEach((node, id) => {
      nodes.push(
        <Node
          key={id}
          node={node}
          onMouseDown={this.onItemMouseDown}
          onMouseUp={this.onItemMouseUp}
          currentItem={this.props.viewState.draggingItem}
          isSelected={this.props.viewState.selectedNode === node}
        />
      );
    });

    this.props.graph.links.forEach((link, id) => {
      links.push(
        <Link
          key={id}
          link={link}
          isDisabled={shouldDisableLinks}
        />
      )
    });

    const tempLink = this.renderTempLink();

    return (
      <HotKeys keyMap={{
        center: 'c',
        // delete: 'backspace',
      }} handlers={{
        center: () => this.props.viewState.centerBox(this.svgElement.current.getBBox()),
      }} style={{
        position: 'absolute',
        outline: 'none',
      }}
      >
        <svg
          style={{
            position: 'relative',
            border: '2px solid',
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
          onMouseLeave={this.onMouseLeave}
        >
          {/* <g id='coord-syst'>
            <line x1='-4' x2='4' y1='0' y2='0' stroke="white" strokeWidth="2" />
            <line x1='0' x2='0' y1='-4' y2='4' stroke="white" strokeWidth="2" />
          </g> */}
          {/* <g style={{
            opacity: this.props.viewState.isMouseDown && this.props.viewState.draggingItem instanceof PortStore ? .3 : 1,
          }}> */}
          {links}
          {/* </g> */}
          {tempLink}
          {nodes}
        </svg>
      </HotKeys>
    );
  }
};
