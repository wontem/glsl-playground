import * as React from 'react';
import { init } from '../actions/canvasView';

interface Props {
  init: typeof init;
}

export class View extends React.Component<Props> {
  initView = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('webgl2');

    this.props.init(context);
  }

  render() {
    return (
      <canvas
        width={400}
        height={225}
        ref={this.initView}
      />
    );
  }
}
