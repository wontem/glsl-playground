import * as React from 'react';
import { loadWASM } from 'onigasm';
import { Registry } from 'monaco-textmate'; // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate';
import onigasmAsm from 'onigasm/lib/onigasm.wasm';
import glslLanguage from './glsl.tmLanguage';

import styled from 'styled-components';
import MonacoEditor, { EditorWillMount, EditorDidMount } from 'react-monaco-editor';

import { Props, State } from './Editor.models';
import { editor } from 'monaco-editor';

const Container = styled.div`
  height: 0;
  flex-grow: 1;
`;

const List = styled.ul`
  max-height: 100px;
  overflow-y: auto;
  font-family: "Fira Code", Menlo, Monaco, "Courier New", monospace;
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
    await loadWASM(onigasmAsm); // See https://www.npmjs.com/package/onigasm#light-it-up

    const registry = new Registry({
      getGrammarDefinition: async (scopeName) => {
        if (scopeName === 'source.glsl') {
          return {
            format: 'plist',
            content: glslLanguage,
          }
        }

        return null;
      }
    });

    // map of monaco "language id's" to TextMate scopeNames
    const grammars = new Map();
    grammars.set('plaintext', 'source.glsl');

    await wireTmGrammars(monaco, registry, grammars);
  }

  editorDidMount: EditorDidMount = (editor) => {
    this.editor = editor;
  }

  render() {
    return (
      <React.Fragment>
        <Container>
          <MonacoEditor
            language='plaintext'
            options={{
              automaticLayout: true,
              fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
              scrollBeyondLastLine: false,
            }}
            value={this.props.source}
            onChange={(value) => this.props.onChange(this.props.name, value)}
            editorWillMount={this.editorWillMount}
            editorDidMount={this.editorDidMount}
          />
        </Container>
        <List>
          {this.props.errors.map((value) => {
            return (
              <ErrorLine
                key={value.fullMessage}
                item={value.item}
                message={value.message}
                line={value.line}
                onClick={(lineNumber) => {
                  this.editor.revealLineInCenter(lineNumber);
                  this.editor.setPosition({
                    lineNumber,
                    column: 0,
                  })
                }}
              />
            );
          })}
        </List>
      </React.Fragment>
    );
  }
}
