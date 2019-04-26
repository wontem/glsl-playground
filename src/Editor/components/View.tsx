import { MdFiberManualRecord, MdHighQuality, MdFullscreen, MdPlayArrow, MdPause, MdSkipPrevious, MdSave, MdFolderOpen, MdImage, MdCheck } from 'react-icons/md';
import { StyledIcon } from './Icon';
import * as React from 'react';
import { GLSLView } from './GLSLView';
import { Props, State } from './View.models';
import { ProjectData } from '../actions/canvasView';
import { styled, Input } from 'reakit';
import { AnimationLoop } from '../utils/AnimationLoop';

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

const HeaderInput = styled(Input)`
  flex-grow: 1;
  font-size: 12px;
  margin: 2px;
  line-height: 20px;
  background: rgba(0, 0, 0, 0.1);
  padding: 0 8px;
  border-radius: 4px;
  outline: none;
`;

const CanvasWrapper = styled('div')`
  width: 400px;
  height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GLSLViewStyled = styled(GLSLView)`
  max-height: 100%;
  max-width: 100%;
`;


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

const saveImage = (canvas: HTMLCanvasElement, name: string) => {
  canvas.toBlob((blob) => {
    saveFile(blob, name);
  });
};

const createProjectFile = (data: ProjectData): Blob => {
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
};

const getMousePos = (e: React.MouseEvent): [number, number] => {
  const rect = e.currentTarget.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  return [x, 1. - y];
}

export class View extends React.Component<Props, State> {
  private animationLoop: AnimationLoop = new AnimationLoop();
  private viewRef: React.RefObject<GLSLView>;
  private recorder: MediaRecorder;

  constructor(props: Props) {
    super(props);

    this.viewRef = React.createRef();

    const time = performance.now();

    this.state = {
      isMousePressed: false,
      mouseStart: [0, 0],
      mouseEnd: [0, 0],
      mouse: [0, 0],
      isPlaying: false,
      startTime: time,
      currentTime: time,
      prevTime: time,
      currentFrame: 0,
      isHD: false,
      isRecording: false,
      name: '',
      width: 1200,
      height: 1200,
      currentWidth: 1200,
      currentHeight: 1200,
    };

    this.animationLoop = new AnimationLoop();
    this.animationLoop.on('tick', () => {
      // if (this.state.isRecording) {
      //   this.recorder.pause();
      // }
      this.setState({
        currentTime: performance.now(),
        prevTime: this.state.currentTime,
        currentFrame: this.state.currentFrame + 1,
      });
      // if (this.state.isRecording) {
      //   this.recorder.resume();
      // }
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

  componentDidMount() {
    this.recorder = new MediaRecorder((this.viewRef.current.getCanvas() as any).captureStream());
    this.recorder.ondataavailable = (event) => {
      saveFile(event.data, `${this.state.name}_${Date.now()}.webm`);
    };
  }

  componentWillUnmount() {
    this.recorder = null;
  }

  onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button !== 0) {
      return;
    }

    this.setState({
      mouseStart: getMousePos(e),
      isMousePressed: true,
    });
  }

  onMouseUp: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (e.button !== 0) {
      return;
    }

    this.setState({
      isMousePressed: false,
    });
  }

  onMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const pos = getMousePos(e);

    this.setState({
      mouseEnd: this.state.isMousePressed ? pos : this.state.mouseEnd,
      mouse: pos,
    });
  }

  render() {
    const time = (this.state.currentTime - this.state.startTime) / 1000;
    const pixelRatio = this.state.isHD ? 2. : 1.;

    return (
      <React.Fragment>
        <Panel>
          <StyledIcon><label style={{ cursor: 'pointer' }}><MdFolderOpen /><input
            style={{ display: 'none' }}
            onChange={(event) => {
              const reader = new FileReader();
              const file = event.target.files[0];

              reader.addEventListener('load', (event) => {
                const jsonString = (event.target as FileReader).result as string;
                const project: ProjectData = JSON.parse(jsonString);

                this.props.setProjectName(file.name);
                this.props.setProject(project);
                this.setState({
                  name: /(.*)_\d+\.json/.exec(file.name)[1],
                });
              });
              reader.readAsText(file);
            }}
            type='file'
            accept='application/json'
          /></label></StyledIcon>
          <HeaderInput
            value={this.state.name}
            onChange={(event: any) => {
              this.setState({
                name: event.target.value,
              });
            }}
          />
          <StyledIcon onClick={() => {
            saveFile(createProjectFile({
              buffers: this.props.buffers,
              textures: this.props.textures,
              buffersOrder: this.props.buffersOrder,
              outputBuffer: this.props.outputBuffer,
            }), `${this.state.name}_${Date.now()}.json`);
          }} ><MdSave /></StyledIcon>
          <StyledIcon onClick={() => {
            saveImage(this.viewRef.current.getCanvas(), `${this.state.name}_${Date.now()}.png`);
          }} ><MdImage /></StyledIcon>
        </Panel>
        <CanvasWrapper>
          <GLSLViewStyled
            textures={this.props.textures}
            buffers={this.props.buffers}
            buffersOrder={this.props.buffersOrder}
            outputBuffer={this.props.outputBuffer}
            width={this.state.currentWidth * pixelRatio}
            height={this.state.currentHeight * pixelRatio}
            onError={this.props.onError}
            uniforms={[
              {
                name: 'u_mouse',
                method: '2f',
                value: [...this.state.mouse],
              },
              {
                name: 'u_mouse_start',
                method: '2f',
                value: [...this.state.mouseStart],
              },
              {
                name: 'u_mouse_end',
                method: '2f',
                value: [...this.state.mouseEnd],
              },
              {
                name: 'u_mouse_pressed',
                method: '1i',
                value: [this.state.isMousePressed ? 1 : 0],
              },
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

            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            onMouseUp={this.onMouseUp}
            ref={this.viewRef}
          />
        </CanvasWrapper>
        <Panel>
          <HeaderInput
            value={this.state.width}
            onChange={(event: any) => {
              const value = parseInt(event.target.value);
              if (!isNaN(value) && value > 0) {
                this.setState({
                  width: value,
                });
              }
            }}
          />
          <HeaderInput
            value={this.state.height}
            onChange={(event: any) => {
              const value = parseInt(event.target.value);
              if (!isNaN(value) && value > 0) {
                this.setState({
                  height: value,
                });
              }
            }}
          />
          <StyledIcon
            onClick={() => {
              this.setState({
                currentWidth: this.state.width,
                currentHeight: this.state.height,
              });
            }}
          ><MdCheck /></StyledIcon>
        </Panel>
        <Panel>
          <StyledIcon onClick={() => this.resetAnimation()}><MdSkipPrevious /></StyledIcon>
          <StyledIcon onClick={() => this.setState({ isPlaying: !this.state.isPlaying })}>
            {this.state.isPlaying ? <MdPause /> : <MdPlayArrow />}
          </StyledIcon>
          <StyledIcon isActive={this.state.isRecording} color='red' onClick={() => {
            if (this.state.isRecording) {
              this.recorder.stop();
            } else {
              this.recorder.start();
            }

            this.setState({
              isRecording: !this.state.isRecording,
            });
          }}><MdFiberManualRecord /></StyledIcon>
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
