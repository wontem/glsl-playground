import * as React from 'react';
import { init } from '../actions/canvasView';
import { toggleAnimation, resetAnimation } from '../actions/animation';
import { Point } from './Point';
import styled from 'styled-components';

interface Props {
  isPlaying: boolean;
  init: typeof init;
  toggleAnimation: typeof toggleAnimation;
  resetAnimation: typeof resetAnimation;
}

const Panel = styled.div`
  display: flex;
`

const Controls: React.SFC<Props> = (props) => (
  <Panel>
    <Point onClick={() => props.resetAnimation()} />
    <Point isActive={props.isPlaying} onClick={() => props.toggleAnimation(!props.isPlaying)} />
  </Panel>
);

export class View extends React.Component<Props> {
  initView = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('webgl2') as WebGL2RenderingContext;

    this.props.init(context);
  }

  render() {
    return (
      <div>
        <canvas
          width={400}
          height={225}
          ref={this.initView}
        />
        <Controls {...this.props} />
      </div>
    );
  }
}
