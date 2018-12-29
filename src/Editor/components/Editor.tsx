import * as React from 'react';

import { styled } from 'reakit';
import MonacoEditor, { EditorWillMount, EditorDidMount, ChangeHandler } from 'react-monaco-editor';

import { Props, State } from './Editor.models';
import { editor } from 'monaco-editor';

import { language } from '../glsl.language';

const Container = styled.div`
  height: 0;
  flex-grow: 1;
`;

const List = styled.ul`
  max-height: 100px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 16px;
`;

const Line = styled.li`
  display: flex;
  cursor: pointer;

  &:nth-child(2n + 1) {
    background: rgba(0, 0, 0, .1);
  }

  & > div {
    padding: 0px 8px;

    &:nth-child(1) {
      background: rgba(0, 0, 0, .1);
      width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
      text-align: right;
    }

    &:nth-child(2) {
      flex-grow: 1;
    }
  }
`

const ErrorLine = (props: {
  line: number;
  item: string;
  message: string;
  onClick: (line: number) => void;
}) => (
  <Line onClick={() => {
    props.onClick(props.line);
  }}>
    <div>{props.item}</div>
    <div>{props.message}</div>
  </Line>
);

export class Editor extends React.Component<Props, State> {
  private editor: editor.IStandaloneCodeEditor;

  editorWillMount: EditorWillMount = async (monaco) => {
    monaco.languages.register({
      id: 'glsl',
    });

    monaco.languages.setMonarchTokensProvider('glsl', language);
  };

  editorDidMount: EditorDidMount = (editor) => {
    this.editor = editor;
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.name !== prevProps.name && this.editor) {
      this.editor.setValue(this.props.source);
    }
  }

  onChange: ChangeHandler = (value) => this.props.onChange(this.props.name, value)

  render() {
    return (
      <React.Fragment>
        <Container>
          <MonacoEditor
            language='glsl'
            options={{
              automaticLayout: true,
              fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
              scrollBeyondLastLine: false,
              readOnly: !this.props.name,
            }}
            onChange={this.onChange}
            editorWillMount={this.editorWillMount}
            editorDidMount={this.editorDidMount}
          />
        </Container>
        <List>
          {this.props.errors.map((value, index) => {
            return (
              <ErrorLine
                key={index}
                item={value.item}
                message={value.message}
                line={value.line}
                onClick={(lineNumber) => {
                  this.editor.revealLineInCenter(lineNumber);
                  this.editor.setPosition({
                    lineNumber,
                    column: 0,
                  });
                  this.editor.focus();
                }}
              />
            );
          })}
        </List>
      </React.Fragment>
    );
  }
}
