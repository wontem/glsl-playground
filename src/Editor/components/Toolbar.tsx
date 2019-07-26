import * as React from 'react';
import {
  MdCheck,
  MdEdit,
  MdFolderOpen,
  MdFullscreen,
  MdImage,
  MdSave,
  MdUnfoldLess,
  MdUnfoldMore,
} from 'react-icons/md';
import styled from 'styled-components';
import { GLContext, GLView } from '../../GLContext';
import { ViewStateStore } from '../../GraphView/stores/ViewStateStore';
import {
  getProjectData,
  ProjectData,
  useProjectData,
} from '../utils/openProject';
import { saveFile, saveImage } from '../utils/saveFile';
import { context as EditorContext } from './EditorContext';
import { FPS } from './FPS';
import { StyledIcon } from './Icon';
import { Recorder } from './Recorder';

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

const HeaderInput = styled.input`
  flex-grow: 1;
  font-size: 12px;
  margin: 2px;
  line-height: 20px;
  background: rgba(0, 0, 0, 0.1);
  padding: 0 8px;
  border-radius: 4px;
  border: none;
  outline: none;
`;

const GLSLViewStyled = styled(GLView)`
  max-height: 100%;
  max-width: 100%;
  outline: 1px solid #00a6ff;
`;

const CanvasWrapper = styled.div`
  background: url(https://opengameart.org/sites/default/files/Transparency500.png);
  background-repeat: repeat;
  background-size: 50%;
  flex-shrink: 0;
  width: 400px;
  height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const createProjectFile = (data: ProjectData): Blob => {
  return new Blob([JSON.stringify(data, null, '  ')], {
    type: 'application/json',
  });
};

const getMousePos = (e: React.MouseEvent): [number, number] => {
  const rect = e.currentTarget.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  return [x, 1 - y];
};

// FIXME: implement it
interface Props {
  viewState: ViewStateStore;
  // setProject: (name: string) => void;
  // setProjectName: (name: string) => void;
}

interface State {
  mouseStart: number[];
  mouseEnd: number[];
  mouse: number[];
  isMousePressed: boolean;
  name: string;
  width: number;
  height: number;
  currentWidth: number;
  currentHeight: number;
}

export class Toolbar extends React.Component<Props, State> {
  // static contextType = GLContext;
  // context!: React.ContextType<typeof GLContext>;

  constructor(props: Props) {
    super(props);

    const time = performance.now();

    this.state = {
      isMousePressed: false,
      mouseStart: [0, 0],
      mouseEnd: [0, 0],
      mouse: [0, 0],
      name: '',
      width: 2048,
      height: 2048,
      currentWidth: 2048,
      currentHeight: 2048,
    };
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
    return (
      <React.Fragment>
        <Panel>
          <GLContext.Consumer>
            {([glState]) => (
              <StyledIcon>
                <label style={{ cursor: 'pointer' }}>
                  <MdFolderOpen />
                  <input
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      if (!event.target.files) {
                        return;
                      }

                      const reader = new FileReader();
                      const file = event.target.files[0];

                      reader.addEventListener('load', (event) => {
                        const jsonString = (event.target as FileReader)
                          .result as string;

                        const project: ProjectData = JSON.parse(jsonString);

                        this.setState({
                          name: project.name,
                        });

                        this.props.viewState.graph.clear();
                        useProjectData(
                          this.props.viewState.graph,
                          project,
                          glState!,
                        );
                      });
                      reader.readAsText(file);
                    }}
                    type="file"
                    accept="application/json"
                  />
                </label>
              </StyledIcon>
            )}
          </GLContext.Consumer>
          <HeaderInput
            value={this.state.name}
            onChange={(event: any) => {
              this.setState({
                name: event.target.value,
              });
            }}
          />
          <StyledIcon
            onClick={() => {
              const data = getProjectData(
                this.state.name,
                this.props.viewState.graph,
              );

              saveFile(
                createProjectFile(data),
                `${this.state.name}_${Date.now()}.json`,
              );
            }}
          >
            <MdSave />
          </StyledIcon>
          <GLContext.Consumer>
            {([gl]) => (
              <StyledIcon
                onClick={() => {
                  if (gl && gl.canvas) {
                    saveImage(
                      gl.canvas,
                      `${this.state.name}_${Date.now()}.png`,
                    );
                  }
                }}
              >
                <MdImage />
              </StyledIcon>
            )}
          </GLContext.Consumer>
        </Panel>
        <CanvasWrapper>
          <GLSLViewStyled
            width={this.state.currentWidth}
            height={this.state.currentHeight}
          />
        </CanvasWrapper>
        <Panel>
          <HeaderInput
            value={this.state.width}
            onChange={(event: any) => {
              const value = parseInt(event.target.value, 10);
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
              const value = parseInt(event.target.value, 10);
              if (!isNaN(value) && value > 0) {
                this.setState({
                  height: value,
                });
              }
            }}
          />
          <StyledIcon
            onClick={() => {
              const dimensions = {
                width: this.state.currentWidth * 2,
                height: this.state.currentHeight * 2,
              };

              this.setState({
                currentWidth: dimensions.width,
                currentHeight: dimensions.height,
                ...dimensions,
              });
            }}
          >
            <MdUnfoldMore />
          </StyledIcon>
          <StyledIcon
            onClick={() => {
              const dimensions = {
                width: Math.floor(this.state.width / 2),
                height: Math.floor(this.state.height / 2),
              };

              this.setState({
                currentWidth: dimensions.width,
                currentHeight: dimensions.height,
                ...dimensions,
              });
            }}
          >
            <MdUnfoldLess />
          </StyledIcon>
          <StyledIcon
            onClick={() => {
              this.setState({
                currentWidth: this.state.width,
                currentHeight: this.state.height,
              });
            }}
          >
            <MdCheck />
          </StyledIcon>
        </Panel>
        <Panel>
          <Recorder projectName={this.state.name} />
          <EditorContext.Consumer>
            {([state, setState]) => (
              <StyledIcon
                color="#00a6ff"
                isActive={state.isVisible}
                onClick={() => {
                  setState({
                    ...state,
                    isVisible: !state.isVisible,
                  });
                }}
              >
                <MdEdit />
              </StyledIcon>
            )}
          </EditorContext.Consumer>
          <GLContext.Consumer>
            {([gl]) => (
              <StyledIcon
                onClick={() => {
                  const canvas = gl && gl.canvas;

                  if (canvas) {
                    canvas.requestFullscreen();
                  }
                }}
              >
                <MdFullscreen />
              </StyledIcon>
            )}
          </GLContext.Consumer>
          <FPS />
        </Panel>
      </React.Fragment>
    );
  }
}
