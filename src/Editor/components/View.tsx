import { EventEmitter } from 'events';
import * as React from 'react';
// import { init } from '../actions/canvasView';
import { Point } from './Point';
import styled from 'styled-components';
import { GLSLView } from './GLSLView';
import { Props, State } from './View.models';

const Panel = styled.div`
  display: flex;
  align-items: center;
`;

const Info = styled.div`
  font-family: "Fira Code";
  font-size: 12px;
  flex-grow: 1;
  flex-shrink: 0;
  width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
`;

class AnimationLoop extends EventEmitter {
  private fps: number;
  private fpsBeginTime: number;
  private fpsPrevTime: number;
  private fpsFramesElapsed: number;

  private isPlaying: boolean;
  private frameId: number;

  constructor() {
    super();

    this.isPlaying = false;
    this.frameId = null;

    this.fpsReset();
  }

  fpsBegin() {
    this.fpsBeginTime = performance.now();
  }

  fpsEnd() {
    const time = performance.now();
    this.fpsFramesElapsed += 1;

    if (time >= this.fpsPrevTime + 1000) {
      this.fps = (this.fpsFramesElapsed * 1000) / (time - this.fpsPrevTime);

      this.fpsPrevTime = time;
      this.fpsFramesElapsed = 0;
    }
  }

  loop() {
    this.fpsBegin();

    this.emit('tick');

    this.frameId = requestAnimationFrame(() => {
      this.fpsEnd();
      this.loop();
    });
  }

  getFPS() {
    return this.fps;
  }

  fpsReset() {
    this.fps = 0;
    this.fpsFramesElapsed = 0;
    this.fpsBeginTime = performance.now();
    this.fpsPrevTime = this.fpsBeginTime;
  }

  togglePlay(isPlaying: boolean) {
    if (isPlaying !== this.isPlaying) {
      this.isPlaying = isPlaying;

      if (isPlaying) {
        this.loop();
      } else {
        cancelAnimationFrame(this.frameId);
        this.fpsReset();
        this.frameId = null;
      }
    }
  }
}

export class View extends React.Component<Props, State> {
  private animationLoop: AnimationLoop;

  constructor(props: Props) {
    super(props);

    const time = performance.now();

    this.state = {
      isPlaying: false,
      startTime: time,
      currentTime: time,
      prevTime: time,
      currentFrame: 0,
    };

    this.animationLoop = new AnimationLoop();
    this.animationLoop.on('tick', () => {
      this.setState({
        currentTime: performance.now(),
        prevTime: this.state.currentTime,
        currentFrame: this.state.currentFrame + 1,
      });
    });
  }

  resetAnimation() {
    const time = performance.now();

    this.setState({
      startTime: time,
      currentTime: time,
      prevTime: time,
      currentFrame: 0,
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.isPlaying !== this.state.isPlaying) {
      if (this.state.isPlaying) {
        this.setState({
          startTime: this.state.startTime + performance.now() - this.state.currentTime,
          prevTime: performance.now(),
        });
      }

      this.animationLoop.togglePlay(this.state.isPlaying);
    }
  }

  render() {
    const time = (this.state.currentTime - this.state.startTime) / 1000;

    return (
      <React.Fragment>
        <GLSLView
          buffers={this.props.buffers}
          buffersOrder={this.props.buffersOrder}
          outputBuffer={this.props.outputBuffer}
          width={400}
          height={225}
          onError={this.props.onError}
          uniforms={[
            {
              name: 'u_time',
              method: '1f',
              value: [time],
            },
            {
              name: 'u_dela_time',
              method: '1f',
              value: [(this.state.currentTime - this.state.prevTime) / 1000],
            },
            {
              name: 'u_frame',
              method: '1f',
              value: [this.state.currentFrame],
            }
          ]}

          // TODO: implement
          textures={{}}
        />
        <Panel>
          <Point onClick={() => this.resetAnimation()} />
          <Point isActive={this.state.isPlaying} onClick={() => this.setState({ isPlaying: !this.state.isPlaying })} />
          <Info>{time.toFixed(3)}</Info>
          <Info>{this.state.currentFrame}</Info>
          <Info>{this.animationLoop.getFPS().toFixed(1)}</Info>
        </Panel>
      </React.Fragment>
    );
  }
}
