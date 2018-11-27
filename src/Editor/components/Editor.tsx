import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Controlled as CodeMirror, ICodeMirror, IInstance } from 'react-codemirror2';
import { updateBufferRequest } from '../actions/canvasView';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/keymap/sublime';
import { BufferInfo } from '../reducers/canvasView';
import { LineWidget } from 'codemirror';

const CM = styled(CodeMirror)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  & > div {
    flex-grow: 1;
    font-family: 'Fira Code', Menlo, Monaco, 'Courier New', monospace;
    font-size: 13px;
    line-height: 20px;
  }
`;

interface Props extends BufferInfo {
  onChange: typeof updateBufferRequest;
}

interface State {
  value: string;
}

const Line = styled.div`
  display: flex;

  & > div {
    padding: 0px 4px;
    color: white;

    &:nth-child(1) {
      background: maroon;
      width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
      text-align: right;
    }

    &:nth-child(2) {
      background: red;
      flex-grow: 1;
    }
  }
`

const ErrorLine = (props) => (
  <Line>
    <div>{props.item}</div>
    <div>{props.message}</div>
  </Line>
);


export class Editor extends React.Component<Props, State> {
  private instance: IInstance;
  private widgets: [HTMLElement, LineWidget][];

  constructor(props) {
    super(props);

    this.instance = null;
    this.widgets = [];

    this.state = {
      value: props.source,
    };
  }

  private clearWidgets() {
    this.instance.operation(() => {
      this.widgets.forEach(([node, widget]) => {
        ReactDOM.unmountComponentAtNode(node);
        widget.clear();
      });
    });

    this.widgets = [];
  }

  private onChange: ICodeMirror['onChange'] = (editor, data, value) => {
    this.props.onChange(this.props.name, value);
  }

  componentDidUpdate(prevProps) {
    if (this.props.source !== prevProps.source) {
      this.setState({
        value: this.props.source,
      });
    }

    if (this.props.errors !== prevProps.errors) {
      if (this.instance) {
        this.clearWidgets();
        this.props.errors.forEach((log) => {
          const line = document.createElement('div');

          ReactDOM.render(<ErrorLine item={log.item} message={log.message} />, line);

          const widget = this.instance.addLineWidget(log.line - 1, line, {
            coverGutter: false,
            noHScroll: true,
            // above: true,
          });

          this.widgets.push([line, widget]);
        });
      }
    }
  }

  render() {
    return (
      <CM
        value={this.state.value}
        onChange={this.onChange}
        options={{
          mode: 'x-shader/x-fragment',
          lineNumbers: true,
          keyMap: 'sublime',
          viewportMargin: Infinity,
        }}
        onBeforeChange={(editor, data, value) => {
          this.setState({ value });
        }}
        editorDidMount={(editor) => {
          this.instance = editor;
        }}
      />
    );
  }
}
