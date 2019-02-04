import { MdImage, MdHighQuality, MdFullscreen, MdPlayArrow, MdPause, MdSkipPrevious, MdSave, MdFolderOpen } from 'react-icons/md';
import { StyledIcon } from './Icon';
import { EventEmitter } from 'events';
import * as React from 'react';
import styled from 'styled-components';
import { GLSLView } from './GLSLView';
import { Props, State } from './View.models';
import { ProjectData } from '../actions/canvasView';
// const CCapture = require('ccapture.js');

const Panel = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
`;

const Info = styled.div`
  font-size: 12px;
  flex-grow: 1;
  flex-shrink: 0;
  width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
`;

const GLSLViewStyled = styled(GLSLView)`
  max-width: 400px;
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

  private fpsBegin(): void {
    this.fpsBeginTime = performance.now();
  }

  private fpsEnd(): void {
    const time = performance.now();
    this.fpsFramesElapsed += 1;

    if (time >= this.fpsPrevTime + 1000) {
      this.fps = (this.fpsFramesElapsed * 1000) / (time - this.fpsPrevTime);

      this.fpsPrevTime = time;
      this.fpsFramesElapsed = 0;
    }
  }

  private loop(): void {
    this.fpsBegin();

    this.emit('tick');

    this.frameId = requestAnimationFrame(() => {
      this.fpsEnd();
      this.loop();
    });
  }

  getFPS(): number {
    return this.fps;
  }

  private fpsReset(): void {
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

const saveFile = (() => {
  const a = document.createElement('a');

  return (blob: Blob, name: string): void => {
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
})();

// const saveImage = (canvas: HTMLCanvasElement, name: string) => {
//   canvas.toBlob((blob) => {
//     saveFile(blob, name);
//   });
// }

const createProjectFile = (data: ProjectData): Blob => {
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
};

export class View extends React.Component<Props, State> {
  private animationLoop: AnimationLoop;
  private viewRef: React.RefObject<GLSLView>;

  constructor(props: Props) {
    super(props);

    this.viewRef = React.createRef();

    const time = performance.now();

    this.state = {
      isPlaying: false,
      startTime: time,
      currentTime: time,
      prevTime: time,
      currentFrame: 0,
      isHD: false,
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
        <Panel>
          <StyledIcon onClick={() => {
            saveFile(createProjectFile({
              buffers: this.props.buffers,
              textures: this.props.textures,
              buffersOrder: this.props.buffersOrder,
              outputBuffer: this.props.outputBuffer,
            }), `glslProject_${Date.now()}.json`);
          }} ><MdSave /></StyledIcon>
          <StyledIcon onClick={() => {
            // saveImage(this.viewRef.current['canvas'].current, `glslProjectIMG_${Date.now()}.png` ); // TODO: remove hack
          }} ><MdImage /></StyledIcon>
          <StyledIcon><label style={{cursor: 'pointer'}}><MdFolderOpen /><input
            style={{display: 'none'}}
            onChange={(event) => {
              const reader = new FileReader();

              reader.addEventListener('load', (event) => {
                const jsonString = (event.target as FileReader).result as string;
                const project: ProjectData = JSON.parse(jsonString);

                this.props.setProject(project);
              });
              reader.readAsText(event.target.files[0]);
            }}
            type='file'
          /></label></StyledIcon>
        </Panel>
        <GLSLViewStyled
          textures={this.props.textures}
          buffers={this.props.buffers}
          buffersOrder={this.props.buffersOrder}
          outputBuffer={this.props.outputBuffer}
          pixelRatio={this.state.isHD ? window.devicePixelRatio : .5}
          width={1200}
          height={1200}
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
              method: '1i',
              value: [this.state.currentFrame],
            }
          ]}

          ref={this.viewRef}
        />
        <Panel>
          <StyledIcon onClick={() => this.resetAnimation()}><MdSkipPrevious /></StyledIcon>
          <StyledIcon onClick={() => this.setState({ isPlaying: !this.state.isPlaying })}>
            {this.state.isPlaying ? <MdPause /> : <MdPlayArrow />}
          </StyledIcon>
          <Info>{time.toFixed(3)}</Info>
          <Info>{this.state.currentFrame}</Info>
          <Info>{(this.state.isPlaying ? this.animationLoop.getFPS() : 0).toFixed(1)}</Info>
          <StyledIcon color='#00a6ff' isActive={this.state.isHD} onClick={() => {
            this.setState({
              isHD: !this.state.isHD,
            });
          }}><MdHighQuality /></StyledIcon>
          <StyledIcon onClick={() => {
            this.viewRef.current.getCanvas().requestFullscreen();
          }} ><MdFullscreen /></StyledIcon>
        </Panel>
      </React.Fragment>
    );
  }
}
